"use server";

import connectDB from "@/lib/db";
import StenoSubscription, { IStenoSubscription } from "@/models/StenoSubscription";
import StenoSubscriptionPlan, { IStenoSubscriptionPlan } from "@/models/StenoSubscriptionPlan";
import StenoSetting from "@/models/StenoSetting";
import User, { UserRole } from "@/models/User";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/services/RazorpayService";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";
import { z } from "zod";
import { createSafeAction } from "@/lib/safe-action";
import { RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";

// Default standard plans if DB is empty
export const DEFAULT_STENO_PLANS = [
  {
    name: "1 Month Steno Pass",
    code: "MONTHLY",
    price: 99,
    originalPrice: 199,
    durationDays: 30,
    description: "शुरुआती अभ्यास के लिए 30 दिनों का संपूर्ण स्टेनो एक्सेस",
    features: [
      "सभी स्टेनो बैचेस का पूर्ण एक्सेस",
      "दैनिक ऑडियो व वीडियो डिक्टेशन",
      "ऑटोमैटिक ट्रांसक्रिप्शन व एक्यूरेसी रिपोर्ट",
      "रामधारी खण्ड 1 व 2, लीगल, एडिटोरियल पैसेज",
      "फुल स्पीड फ़्लक्चुएशन (60 - 120 WPM)"
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "3 Months Exam Special",
    code: "QUARTERLY",
    price: 249,
    originalPrice: 499,
    durationDays: 90,
    description: "परीक्षा की संपूर्ण तैयारी के लिए छात्रों की पहली पसंद",
    features: [
      "सभी स्टेनो बैचेस और सीरीज का 90 दिनों का एक्सेस",
      "साप्ताहिक मॉक टेस्ट और लाइव रैंकिंग",
      "हाई कोर्ट, UPSSSC, UP SI स्पेशल लीगल पैसेज",
      "स्पीड एनालिसिस और मिस्टेक ब्रेकडाउन",
      "शंका समाधान वीडियो सपोर्ट"
    ],
    isPopular: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "6 Months Pro Pass",
    code: "HALF_YEARLY",
    price: 449,
    originalPrice: 899,
    durationDays: 180,
    description: "लंबे समय की ठोस तैयारी और 100+ WPM स्पीड हासिल करने के लिए",
    features: [
      "180 दिनों का अनवरत स्टेनो पोर्टल एक्सेस",
      "भविष्य में आने वाले सभी नए बैचेस शामिल",
      "अनलिमिटेड डिक्टेशन टेस्ट और प्रैक्टिस",
      "डिटेल्ड प्रोग्रेस ग्राफ और एक्यूरेसी ट्रैकिंग",
      "सर्वश्रेष्ठ मूल्य - बचत ₹450"
    ],
    isPopular: false,
    isActive: true,
    sortOrder: 3,
  },
];

/**
 * 1. Check Steno Access Status for Current Student
 * Checks: Admin bypass, 7-Day Free Trial, or Active Paid Subscription
 */
export const checkStenoAccessAction = createSafeAction(
  { requireAuth: true },
  async (_, session) => {
    await connectDB();

    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return {
        hasAccess: false,
        reason: "USER_NOT_FOUND",
        isTrialActive: false,
        trialExpired: false,
        daysLeftInTrial: 0,
      };
    }

    // Admins always have full unrestricted access
    if (
      user.role === UserRole.ADMIN ||
      user.role === "STENO_ADMIN" ||
      user.email === "admin@ngit.edu" ||
      user.email === "admin@ngitedu.com"
    ) {
      return {
        hasAccess: true,
        isAdmin: true,
        isTrialActive: false,
        trialExpired: false,
        daysLeftInTrial: 0,
      };
    }

    // Get Global Steno Settings
    let setting = await StenoSetting.findOne({ key: "global" });
    if (!setting) {
      setting = await StenoSetting.create({
        key: "global",
        freeTrialDays: 7,
        isTrialEnabled: true,
        isSubscriptionMandatory: true,
      });
    }

    if (!setting.isSubscriptionMandatory) {
      return {
        hasAccess: true,
        isFreeMode: true,
        isTrialActive: false,
        trialExpired: false,
        daysLeftInTrial: 0,
      };
    }

    const now = new Date();

    // 1. Check for Active Paid Subscription
    const activeSub = await StenoSubscription.findOne({
      userId: user._id,
      status: "ACTIVE",
      paymentType: { $in: ["ONLINE", "MANUAL"] },
      endDate: { $gt: now },
    })
      .sort({ endDate: -1 })
      .lean();

    if (activeSub) {
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(activeSub.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      return {
        hasAccess: true,
        isSubscribed: true,
        subscription: JSON.parse(JSON.stringify(activeSub)),
        daysLeft,
        isTrialActive: false,
        trialExpired: false,
        daysLeftInTrial: 0,
      };
    }

    // 2. Check or Create 7-Day Free Trial
    if (setting.isTrialEnabled) {
      let trialSub = await StenoSubscription.findOne({
        userId: user._id,
        paymentType: "TRIAL",
      });

      if (!trialSub) {
        // Calculate trial start from user creation date or first Steno access
        // To be student-friendly: if student just signed up, 7 days from signup;
        // if old student visiting Steno for the first time, give them 7 days trial starting today.
        const userCreated = new Date(user.createdAt || now);
        const daysSinceSignup = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60 * 24);

        let trialStart = now;
        let trialEnd = new Date(now.getTime() + setting.freeTrialDays * 24 * 60 * 60 * 1000);

        if (daysSinceSignup < setting.freeTrialDays) {
          trialStart = userCreated;
          trialEnd = new Date(userCreated.getTime() + setting.freeTrialDays * 24 * 60 * 60 * 1000);
        }

        const isStillValid = trialEnd.getTime() > now.getTime();

        trialSub = await StenoSubscription.create({
          userId: user._id,
          planCode: "TRIAL",
          planName: `${setting.freeTrialDays} Days Free Trial`,
          startDate: trialStart,
          endDate: trialEnd,
          status: isStillValid ? "ACTIVE" : "EXPIRED",
          paymentType: "TRIAL",
          amount: 0,
          notes: "Automatic student 7-day free trial on Steno registration",
        });
      }

      const trialEndDate = new Date(trialSub.endDate);
      if (trialEndDate.getTime() > now.getTime()) {
        const daysLeftInTrial = Math.max(
          1,
          Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        return {
          hasAccess: true,
          isTrialActive: true,
          daysLeftInTrial,
          trialEndDate: trialEndDate.toISOString(),
          trialExpired: false,
        };
      } else {
        // Trial expired
        if (trialSub.status !== "EXPIRED") {
          trialSub.status = "EXPIRED";
          await trialSub.save();
        }
        return {
          hasAccess: false,
          isTrialActive: false,
          trialExpired: true,
          daysLeftInTrial: 0,
          trialEndDate: trialEndDate.toISOString(),
        };
      }
    }

    // Neither paid subscription nor trial active
    return {
      hasAccess: false,
      isTrialActive: false,
      trialExpired: true,
      daysLeftInTrial: 0,
    };
  }
);

/**
 * 2. Get Public Subscription Plans (Student View)
 */
export const getStenoSubscriptionPlansAction = createSafeAction(
  {},
  async () => {
    await connectDB();

    let plans = await StenoSubscriptionPlan.find({ isActive: true })
      .sort({ sortOrder: 1, price: 1 })
      .lean();

    // If no plans configured yet, seed the default plans
    if (plans.length === 0) {
      await StenoSubscriptionPlan.insertMany(DEFAULT_STENO_PLANS);
      plans = await StenoSubscriptionPlan.find({ isActive: true })
        .sort({ sortOrder: 1, price: 1 })
        .lean();
    }

    return {
      plans: JSON.parse(JSON.stringify(plans)),
    };
  }
);

/**
 * 3. Initiate Steno Subscription Payment (Razorpay Order)
 */
const InitiateStenoPaymentSchema = z.object({
  planId: z.string().min(1),
});

export const initiateStenoSubscriptionPaymentAction = createSafeAction(
  { schema: InitiateStenoPaymentSchema, requireAuth: true, rateLimit: RATE_LIMIT_CONFIGS.SENSITIVE },
  async ({ planId }, session) => {
    await connectDB();

    const plan = await StenoSubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      throw new Error("Selected subscription plan is not valid or unavailable.");
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      throw new Error("Student account not found.");
    }

    // Check if user already has an active subscription of the same or higher end date
    const now = new Date();
    const existingActiveSub = await StenoSubscription.findOne({
      userId: user._id,
      status: "ACTIVE",
      paymentType: { $in: ["ONLINE", "MANUAL"] },
      endDate: { $gt: now },
    });

    const amount = plan.price;
    const order = await createRazorpayOrder(amount);

    // Create pending subscription intention
    await StenoSubscription.create({
      userId: user._id,
      planId: plan._id,
      planCode: plan.code,
      planName: plan.name,
      startDate: now,
      endDate: now, // will be properly updated on verification
      status: "PENDING",
      paymentType: "ONLINE",
      amount: amount,
      razorpayOrderId: order.id,
      notes: `Order created for ${plan.name}`,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      userName: user.name,
      userEmail: user.email,
      planName: plan.name,
      durationDays: plan.durationDays,
      isExtend: !!existingActiveSub,
    };
  }
);

/**
 * 4. Verify Steno Subscription Payment
 */
const VerifyStenoPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const verifyStenoSubscriptionPaymentAction = createSafeAction(
  { schema: VerifyStenoPaymentSchema, requireAuth: true },
  async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, session) => {
    await connectDB();

    const subRecord = await StenoSubscription.findOne({
      razorpayOrderId,
      userId: session.user.id,
    });

    if (!subRecord) {
      throw new Error("Payment transaction record not found.");
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new Error("Invalid payment signature detected. Please contact support.");
    }

    if (subRecord.status !== "ACTIVE") {
      let durationDays = 30;
      if (subRecord.planId) {
        const plan = await StenoSubscriptionPlan.findById(subRecord.planId);
        if (plan) durationDays = plan.durationDays;
      }

      // Check if user currently has another active subscription to extend
      const now = new Date();
      const existingActive = await StenoSubscription.findOne({
        userId: session.user.id,
        _id: { $ne: subRecord._id },
        status: "ACTIVE",
        endDate: { $gt: now },
      }).sort({ endDate: -1 });

      const startDate = existingActive ? new Date(existingActive.endDate) : now;
      const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      subRecord.startDate = startDate;
      subRecord.endDate = endDate;
      subRecord.status = "ACTIVE";
      subRecord.razorpayPaymentId = razorpayPaymentId;
      subRecord.razorpaySignature = razorpaySignature;
      await subRecord.save();

      // Create confirmation notification
      await createNotification(
        session.user.id,
        "Steno Subscription Activated 🎉",
        `आपकी ${subRecord.planName} स्टेनो सदस्यता सफलतापूर्वक सक्रिय हो गई है। यह ${endDate.toLocaleDateString("hi-IN")} तक मान्य है।`,
        "SYSTEM",
        "/student/steno/series"
      );
    }

    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/subscribe");
    revalidatePath("/steno");

    return {
      success: true,
      message: "Subscription successfully activated!",
      endDate: subRecord.endDate,
    };
  }
);

// =========================================================================
// ADMIN ACTIONS (Super Admin / Admin protected)
// =========================================================================

/**
 * 5. Get All Plans & Settings (Admin Panel)
 */
export const getAdminStenoPlansAction = createSafeAction(
  { requireAuth: true, roles: [UserRole.ADMIN, "STENO_ADMIN"] },
  async () => {
    await connectDB();

    let plans = await StenoSubscriptionPlan.find().sort({ sortOrder: 1, price: 1 }).lean();

    if (plans.length === 0) {
      await StenoSubscriptionPlan.insertMany(DEFAULT_STENO_PLANS);
      plans = await StenoSubscriptionPlan.find().sort({ sortOrder: 1, price: 1 }).lean();
    }

    let setting: any = await StenoSetting.findOne({ key: "global" }).lean();
    if (!setting) {
      const created = await StenoSetting.create({
        key: "global",
        freeTrialDays: 7,
        isTrialEnabled: true,
        isSubscriptionMandatory: true,
      });
      setting = created.toObject();
    }

    const totalActiveSubscribers = await StenoSubscription.countDocuments({
      status: "ACTIVE",
      paymentType: { $in: ["ONLINE", "MANUAL"] },
      endDate: { $gt: new Date() },
    });

    const totalTrialUsers = await StenoSubscription.countDocuments({
      status: "ACTIVE",
      paymentType: "TRIAL",
      endDate: { $gt: new Date() },
    });

    return {
      plans: JSON.parse(JSON.stringify(plans)),
      setting: JSON.parse(JSON.stringify(setting)),
      stats: {
        totalActiveSubscribers,
        totalTrialUsers,
      },
    };
  }
);

/**
 * 6. Save/Update a Steno Plan (Admin Panel)
 */
const SaveStenoPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Plan name is required"),
  code: z.string().min(1, "Plan code is required"),
  price: z.number().min(0, "Price must be >= 0"),
  originalPrice: z.number().optional().default(0),
  durationDays: z.number().min(1, "Duration must be at least 1 day"),
  description: z.string().optional().default(""),
  features: z.array(z.string()).default([]),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const saveStenoPlanAction = createSafeAction(
  { schema: SaveStenoPlanSchema, requireAuth: true, roles: [UserRole.ADMIN, "STENO_ADMIN"] },
  async (data) => {
    await connectDB();

    if (data.id) {
      const updated = await StenoSubscriptionPlan.findByIdAndUpdate(
        data.id,
        {
          name: data.name,
          code: data.code.toUpperCase().trim(),
          price: data.price,
          originalPrice: data.originalPrice,
          durationDays: data.durationDays,
          description: data.description,
          features: data.features,
          isPopular: data.isPopular,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        },
        { new: true }
      );
      revalidatePath("/admin/steno/plans");
      revalidatePath("/student/steno/subscribe");
      return { success: true, plan: JSON.parse(JSON.stringify(updated)) };
    } else {
      const created = await StenoSubscriptionPlan.create({
        name: data.name,
        code: data.code.toUpperCase().trim(),
        price: data.price,
        originalPrice: data.originalPrice,
        durationDays: data.durationDays,
        description: data.description,
        features: data.features,
        isPopular: data.isPopular,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      });
      revalidatePath("/admin/steno/plans");
      revalidatePath("/student/steno/subscribe");
      return { success: true, plan: JSON.parse(JSON.stringify(created)) };
    }
  }
);

/**
 * 7. Delete a Steno Plan (Admin Panel)
 */
const DeleteStenoPlanSchema = z.object({
  planId: z.string().min(1),
});

export const deleteStenoPlanAction = createSafeAction(
  { schema: DeleteStenoPlanSchema, requireAuth: true, roles: [UserRole.ADMIN, "STENO_ADMIN"] },
  async ({ planId }) => {
    await connectDB();
    await StenoSubscriptionPlan.findByIdAndDelete(planId);
    revalidatePath("/admin/steno/plans");
    revalidatePath("/student/steno/subscribe");
    return { success: true };
  }
);

/**
 * 8. Save Steno Global Settings (Trial Days, Mandatory, etc.)
 */
const SaveStenoSettingsSchema = z.object({
  freeTrialDays: z.number().min(0).max(365),
  isTrialEnabled: z.boolean(),
  isSubscriptionMandatory: z.boolean(),
  trialBannerText: z.string().optional(),
});

export const saveStenoSettingsAction = createSafeAction(
  { schema: SaveStenoSettingsSchema, requireAuth: true, roles: [UserRole.ADMIN, "STENO_ADMIN"] },
  async (data) => {
    await connectDB();

    const setting = await StenoSetting.findOneAndUpdate(
      { key: "global" },
      {
        freeTrialDays: data.freeTrialDays,
        isTrialEnabled: data.isTrialEnabled,
        isSubscriptionMandatory: data.isSubscriptionMandatory,
        trialBannerText: data.trialBannerText,
      },
      { upsert: true, new: true }
    );

    revalidatePath("/admin/steno/plans");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/subscribe");
    return { success: true, setting: JSON.parse(JSON.stringify(setting)) };
  }
);

/**
 * 9. Get Subscriptions List for Admin
 */
const GetAdminSubscriptionsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

export const getAdminStenoSubscriptionsAction = createSafeAction(
  { schema: GetAdminSubscriptionsSchema, requireAuth: true, roles: [UserRole.ADMIN, "STENO_ADMIN"] },
  async ({ search, status, page, limit }) => {
    await connectDB();

    const query: any = {};
    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search && search.trim()) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search.trim(), $options: "i" } },
          { email: { $regex: search.trim(), $options: "i" } },
          { mobile: { $regex: search.trim(), $options: "i" } },
        ],
      }).select("_id");
      const userIds = matchingUsers.map((u) => u._id);
      query.userId = { $in: userIds };
    }

    const total = await StenoSubscription.countDocuments(query);
    const subscriptions = await StenoSubscription.find(query)
      .populate("userId", "name email mobile role createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      subscriptions: JSON.parse(JSON.stringify(subscriptions)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
);

/**
 * 10. Manual Subscription Activation / Extension by Admin
 */
const ManualActivateStenoSubSchema = z.object({
  studentId: z.string().min(1),
  planCode: z.string().default("MANUAL"),
  planName: z.string().default("Offline / Manual Steno Pass"),
  durationDays: z.number().min(1).default(30),
  amount: z.number().min(0).default(0),
  notes: z.string().optional().default("Manually activated by Admin"),
});

export const manualActivateStenoSubscriptionAction = createSafeAction(
  { schema: ManualActivateStenoSubSchema, requireAuth: true, roles: [UserRole.ADMIN, "STENO_ADMIN"] },
  async ({ studentId, planCode, planName, durationDays, amount, notes }) => {
    await connectDB();

    const student = await User.findById(studentId);
    if (!student) {
      throw new Error("Student account not found.");
    }

    const now = new Date();
    // Check if student has an existing active subscription to extend
    const existingActive = await StenoSubscription.findOne({
      userId: student._id,
      status: "ACTIVE",
      endDate: { $gt: now },
    }).sort({ endDate: -1 });

    const startDate = existingActive ? new Date(existingActive.endDate) : now;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const createdSub = await StenoSubscription.create({
      userId: student._id,
      planCode: planCode.toUpperCase().trim(),
      planName: planName,
      startDate: startDate,
      endDate: endDate,
      status: "ACTIVE",
      paymentType: "MANUAL",
      amount: amount,
      notes: notes,
    });

    await createNotification(
      student._id.toString(),
      "Steno Subscription Activated by Admin",
      `व्यवस्थापक द्वारा आपकी ${planName} सक्रिय कर दी गई है। यह ${endDate.toLocaleDateString("hi-IN")} तक मान्य है।`,
      "SYSTEM",
      "/student/steno/series"
    );

    revalidatePath("/admin/steno/plans");
    revalidatePath("/student/steno/series");
    revalidatePath("/student/steno/subscribe");

    return {
      success: true,
      subscription: JSON.parse(JSON.stringify(createdSub)),
    };
  }
);
