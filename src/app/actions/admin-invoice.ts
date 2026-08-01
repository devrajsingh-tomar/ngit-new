"use server";

import connectDB from "@/lib/db";
import Invoice, { InvoiceStatus } from "@/models/Invoice";
import Payment, { PaymentStatus } from "@/models/Payment";
import User from "@/models/User";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const generateInvoiceNumber = () => {
    return `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
};

export async function getAdminInvoices() {
    try {
        await connectDB();

        // Ensure models are registered
        await import("@/models/User");
        await import("@/models/Course");
        await import("@/models/Payment");

        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const invoices = await Invoice.find()
            .populate("studentId", "name email phone")
            .populate("courseId", "title price")
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, invoices: JSON.parse(JSON.stringify(invoices)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createInvoice(data: {
    studentId: string;
    courseId: string;
    totalAmount: number;
    dueDate: Date;
    installments: { amount: number; dueDate: Date }[];
    notes?: string;
}) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const invoice = await Invoice.create({
            studentId: data.studentId,
            courseId: data.courseId,
            invoiceNumber: generateInvoiceNumber(),
            totalAmount: data.totalAmount,
            amountPaid: 0,
            balanceDue: data.totalAmount,
            status: InvoiceStatus.PENDING,
            installments: data.installments.map(inst => ({
                amount: inst.amount,
                dueDate: inst.dueDate,
                status: InvoiceStatus.PENDING
            })),
            dueDate: data.dueDate,
            notes: data.notes
        });

        revalidatePath("/admin/payments");
        return { success: true, invoice: JSON.parse(JSON.stringify(invoice)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function payInstallment(invoiceId: string, installmentIndex: number) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return { success: false, error: "Invoice not found" };

        const installment = invoice.installments[installmentIndex];
        if (!installment) return { success: false, error: "Installment not found" };

        if (installment.status === InvoiceStatus.PAID) {
            return { success: false, error: "Installment is already paid." };
        }

        // Create a manual Payment record linking it
        const payment = await Payment.create({
            userId: invoice.studentId,
            courseId: invoice.courseId,
            amount: installment.amount,
            status: PaymentStatus.SUCCESS,
            razorpayOrderId: `manual_inst_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        });

        // Update the installment
        installment.status = InvoiceStatus.PAID;
        installment.paidAt = new Date();
        installment.paymentId = payment._id as any;

        // Update the invoice totals
        invoice.amountPaid += installment.amount;
        invoice.balanceDue -= installment.amount;

        // Check if fully paid
        if (invoice.balanceDue <= 0) {
            invoice.status = InvoiceStatus.PAID;
        } else {
            invoice.status = InvoiceStatus.PARTIAL;
        }

        await invoice.save();
        revalidatePath("/admin/payments");

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentInvoices() {
    try {
        await connectDB();
        await import("@/models/Course");
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const invoices = await Invoice.find({ studentId: session.user.id })
            .populate("courseId", "title price")
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, invoices: JSON.parse(JSON.stringify(invoices)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
