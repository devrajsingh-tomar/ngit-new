export interface OLevelBook {
  id: string;
  moduleCode: string;
  fullTitle: string;
  shortTitle: string;
  tagline: string;
  description: string;
  coverImage: string;
  coverImageWebp: string;
  fullSpreadImage: string;
  badgeColor: string;
  accentColor: string;
  edition: string;
  language: string;
  syllabus: string;
  mrp: number;
  author: string;
  keyTopics: string[];
  seoKeywords: string[];
  enquiryMessage: string;
  courseLink: string;
  priceNote: string;
  availability: string;
}

export const O_LEVEL_WHATSAPP_CONFIG = {
  phoneNumber: "8840341525", // Direct NGIT book desk number as printed on book covers
  countryCode: "91",
  displayNumber: "+91 88403 41525",
  alternateNumber: "+91 80049 58441",
  instituteAddress: "Sainik Market, Sanjay Dryers Chauraha, Rasulabad, Prayagraj, UP 211004",
};

export function buildWhatsAppUrl(message: string, phone: string = O_LEVEL_WHATSAPP_CONFIG.phoneNumber): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message.trim())}`;
}

export const GENERAL_O_LEVEL_ENQUIRY_MESSAGE =
  "Hello NGIT, I would like to enquire about the complete set of NIELIT O Level books (M1-R5.1, M2-R5.1, M3-R5.1, and M4-R5.1 - Combo MRP ₹1,680). Please share the combo discounted price, syllabus coverage, availability, and home delivery details in Prayagraj.";

export const O_LEVEL_BOOKS: OLevelBook[] = [
  {
    id: "m1-r5-1",
    moduleCode: "M1-R5.1",
    fullTitle: "Information Technology Tools and Network Basics",
    shortTitle: "IT Tools and Network Basic",
    tagline: "Computer Fundamentals, Operating Systems, LibreOffice Suite & Internet Technology",
    description:
      "Explore comprehensive learning resources covering IT fundamentals, productivity tools, operating systems, internet concepts, digital financial tools, and computer networking, subject to the actual book contents.",
    coverImage: "/images/books/nielit-o-level-m1-r5-it-tools.png",
    coverImageWebp: "/images/books/nielit-o-level-m1-r5-it-tools.webp",
    fullSpreadImage: "/images/books/nielit-o-level-m1-r5-full-spread.jpg",
    badgeColor: "bg-red-500/10 text-red-600 border-red-200",
    accentColor: "from-red-600 to-rose-700",
    edition: "NGIT Infinity Series (Latest R5.1 Edition)",
    language: "Hindi + English (Bilingual)",
    syllabus: "NIELIT O Level Revised Syllabus R5.1",
    mrp: 380,
    author: "Javed Sir (Director, NGIT Institute)",
    keyTopics: [
      "Introduction to Computer & OS (Windows / Linux)",
      "Word Processing & Spreadsheet (LibreOffice Writer & Calc)",
      "Presentation Software (LibreOffice Impress)",
      "Introduction to Internet, WWW & Web Browsing",
      "E-mail, Social Networking & e-Governance Services",
      "Digital Financial Tools, Applications & Cyber Security",
    ],
    seoKeywords: [
      "NIELIT O Level M1-R5.1 book",
      "O Level IT Tools and Network Basics book",
      "NGIT O Level books Prayagraj",
      "Best O Level M1 book in Prayagraj",
    ],
    enquiryMessage:
      "Hello NGIT, I would like to enquire about the NIELIT O Level M1-R5.1 book, Information Technology Tools and Network Basics (Printed MRP ₹380). Please share current student discount, availability, book contents, and ordering details.",
    courseLink: "/courses/o-level-nielit-certified",
    priceNote: "Printed MRP: ₹380/- (Contact for Student Discount)",
    availability: "Available for Center Pickup & Postal Delivery",
  },
  {
    id: "m2-r5-1",
    moduleCode: "M2-R5.1",
    fullTitle: "Web Designing and Publishing",
    shortTitle: "Web Designing & Publishing",
    tagline: "HTML5, CSS3, JavaScript, Responsive Web Design & Web Hosting",
    description:
      "Explore resources for web designing, webpage structure, HTML, CSS, JavaScript, responsive frameworks, and web publishing, subject to the actual book contents.",
    coverImage: "/images/books/nielit-o-level-m2-r5-web-designing.png",
    coverImageWebp: "/images/books/nielit-o-level-m2-r5-web-designing.webp",
    fullSpreadImage: "/images/books/nielit-o-level-m2-r5-full-spread.jpg",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
    accentColor: "from-blue-600 to-indigo-700",
    edition: "NGIT Infinity Series (Latest R5.1 Edition)",
    language: "Hindi + English (Bilingual)",
    syllabus: "NIELIT O Level Revised Syllabus R5.1",
    mrp: 430,
    author: "Javed Sir (Director, NGIT Institute)",
    keyTopics: [
      "Web Design & HTML5 Semantic Structure",
      "CSS3 Styling, Selectors, Box Model & Flexbox",
      "CSS Frameworks (W3.CSS / Responsive Grid)",
      "Client-Side Scripting with JavaScript",
      "Photo Editing & Web Graphic Optimization",
      "Web Publishing, Domain Registration & Hosting",
    ],
    seoKeywords: [
      "NIELIT O Level M2-R5.1 book",
      "O Level Web Designing book",
      "NGIT Web Designing practice book",
      "Best O Level M2 book in Prayagraj",
    ],
    enquiryMessage:
      "Hello NGIT, I would like to enquire about the NIELIT O Level M2-R5.1 book, Web Designing and Publishing (Printed MRP ₹430). Please share current student discount, availability, book contents, and ordering details.",
    courseLink: "/courses/o-level-nielit-certified",
    priceNote: "Printed MRP: ₹430/- (Contact for Student Discount)",
    availability: "Available for Center Pickup & Postal Delivery",
  },
  {
    id: "m3-r5-1",
    moduleCode: "M3-R5.1",
    fullTitle: "Programming and Problem Solving through Python",
    shortTitle: "Programming & Problem Solving through Python",
    tagline: "Python Fundamentals, Algorithms, Data Structures, NumPy & File Handling",
    description:
      "Explore resources covering Python programming fundamentals, data types, operators, conditions, loops, functions, and problem-solving, subject to the actual book contents.",
    coverImage: "/images/books/nielit-o-level-m3-r5-python-programming.png",
    coverImageWebp: "/images/books/nielit-o-level-m3-r5-python-programming.webp",
    fullSpreadImage: "/images/books/nielit-o-level-m3-r5-full-spread.png",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    accentColor: "from-emerald-600 to-teal-700",
    edition: "NGIT Infinity Series (Latest R5.1 Edition)",
    language: "Hindi + English (Bilingual)",
    syllabus: "NIELIT O Level Revised Syllabus R5.1",
    mrp: 490,
    author: "Javed Sir (Director, NGIT Institute)",
    keyTopics: [
      "Flowcharts, Algorithms & Problem Solving",
      "Python Basics, Variables, Expressions & Operators",
      "Conditional Branching & Loop Iterations",
      "Sequences: Strings, Lists, Tuples, Dictionaries & Sets",
      "Functions, Scope, Recursion & Modular Programming",
      "File I/O Operations & Introduction to NumPy Array Processing",
    ],
    seoKeywords: [
      "NIELIT O Level Python book",
      "O Level M3-R5.1 book",
      "O Level Python practice book",
      "Best O Level Python book in Prayagraj",
    ],
    enquiryMessage:
      "Hello NGIT, I would like to enquire about the NIELIT O Level M3-R5.1 book, Programming and Problem Solving through Python (Printed MRP ₹490). Please share current student discount, availability, book contents, and ordering details.",
    courseLink: "/courses/o-level-nielit-certified",
    priceNote: "Printed MRP: ₹490/- (Contact for Student Discount)",
    availability: "Available for Center Pickup & Postal Delivery",
  },
  {
    id: "m4-r5-1",
    moduleCode: "M4-R5.1",
    fullTitle: "Internet of Things and Its Applications",
    shortTitle: "Internet of Things & its Applications",
    tagline: "IoT Architecture, Sensors, Actuators, Arduino, Security & Soft Skills",
    description:
      "Explore resources covering IoT concepts, architecture, sensors, connected devices, communication technologies, and applications, subject to the actual book contents.",
    coverImage: "/images/books/nielit-o-level-m4-r5-internet-of-things.png",
    coverImageWebp: "/images/books/nielit-o-level-m4-r5-internet-of-things.webp",
    fullSpreadImage: "/images/books/nielit-o-level-m4-r5-full-spread.jpg",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
    accentColor: "from-purple-600 to-violet-700",
    edition: "NGIT Infinity Series (Latest R5.1 Edition)",
    language: "Hindi + English (Bilingual)",
    syllabus: "NIELIT O Level Revised Syllabus R5.1",
    mrp: 380,
    author: "Javed Sir (Director, NGIT Institute)",
    keyTopics: [
      "Introduction to IoT & Ecosystem Building Blocks",
      "Sensors, Actuators & Microcontroller Architecture",
      "Embedded C / Arduino Programming for IoT",
      "IoT Communication Protocols & Networking",
      "Security & Privacy Challenges in Connected Devices",
      "Personality Development & Soft Skills for IT Professionals",
    ],
    seoKeywords: [
      "NIELIT O Level M4-R5.1 book",
      "O Level IoT book",
      "Internet of Things O Level practice book",
      "Best O Level IoT book in Prayagraj",
    ],
    enquiryMessage:
      "Hello NGIT, I would like to enquire about the NIELIT O Level M4-R5.1 book, Internet of Things and Its Applications (Printed MRP ₹380). Please share current student discount, availability, book contents, and ordering details.",
    courseLink: "/courses/o-level-nielit-certified",
    priceNote: "Printed MRP: ₹380/- (Contact for Student Discount)",
    availability: "Available for Center Pickup & Postal Delivery",
  },
];

export const O_LEVEL_FAQS = [
  {
    question: "Which books are covered for the NIELIT O Level examination?",
    answer:
      "NGIT covers all four core theory modules defined under the NIELIT O Level R5.1 syllabus: M1-R5.1 (Information Technology Tools and Network Basics - MRP ₹380), M2-R5.1 (Web Designing and Publishing - MRP ₹430), M3-R5.1 (Programming and Problem Solving through Python - MRP ₹490), and M4-R5.1 (Internet of Things and Its Applications - MRP ₹380). Each book is tailored to help students prepare for theory MCQs and practical examination requirements.",
  },
  {
    question: "Where can students enquire about O Level books in Prayagraj?",
    answer:
      "Students in Prayagraj can visit NGIT (National Genius Institute of Technology) at Sainik Market, Sanjay Dryers Chauraha, Rasulabad, Prayagraj, UP 211004. You can also enquire or place an order directly over WhatsApp at +91 88403 41525 or phone +91 80049 58441 for home delivery or desk pickup.",
  },
  {
    question: "Does NGIT offer books for M1-R5.1, M2-R5.1, M3-R5.1, and M4-R5.1?",
    answer:
      "Yes, NGIT provides books and learning resources for all four modules (M1-R5.1, M2-R5.1, M3-R5.1, and M4-R5.1). The books are authored under the guidance of Javed Sir (Director, NGIT Institute), featuring bilingual (Hindi + English) explanations, syllabus-aligned theory, and practice question sets.",
  },
  {
    question: "How can students check prices and availability?",
    answer:
      "Printed MRPs are ₹380 for M1, ₹430 for M2, ₹490 for M3, and ₹380 for M4 (Total Combo MRP ₹1,680). Students can click the 'Enquire on WhatsApp' button on any book card or contact the NGIT desk directly at +91 88403 41525 for special student discount rates, combo offers, and postal or courier delivery options.",
  },
  {
    question: "Can students enquire about a particular book through WhatsApp?",
    answer:
      "Yes. Every book card features a dedicated WhatsApp enquiry button that automatically prefills a message specifying that exact module and printed price (e.g. M1-R5.1, M2-R5.1, M3-R5.1, or M4-R5.1). You only need to tap the button, and WhatsApp will open ready for you to send the query.",
  },
];
