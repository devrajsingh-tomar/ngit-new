export interface CatalogCourse {
    id: string;
    level: "UG" | "PG" | "Diploma" | "Certificate";
    name: string;
    fee: number;
    feeNote?: string;
    category: string;
    description: string;
}

export const COURSE_CATALOG: CatalogCourse[] = [
    // Featured UG Programmes
    {
        id: "ug-bsc",
        level: "UG",
        name: "B.Sc.",
        fee: 22000,
        category: "Undergraduate",
        description: "Bachelor of Science degree in foundational scientific disciplines and practical laboratory skills."
    },
    {
        id: "ug-llb",
        level: "UG",
        name: "LLB",
        fee: 8500,
        feeNote: "per semester",
        category: "Undergraduate",
        description: "Professional law degree program focusing on Indian jurisprudence, constitutional law, and legal procedure."
    },
    {
        id: "ug-ba",
        level: "UG",
        name: "BACHELOR OF ARTS",
        fee: 12000,
        category: "Undergraduate",
        description: "Comprehensive 3-year undergraduate degree in Humanities and Social Sciences."
    },
    {
        id: "ug-blis",
        level: "UG",
        name: "BACHELOR OF LIBRARY AND INFORMATION SCIENCES",
        fee: 22000,
        category: "Undergraduate",
        description: "Professional degree program covering information management, digital libraries, and cataloging."
    },
    {
        id: "ug-bba",
        level: "UG",
        name: "BACHELOR OF BUSINESS ADMINISTRATION",
        fee: 22000,
        category: "Undergraduate",
        description: "Foundational business management program developing leadership and analytical skills."
    },
    {
        id: "ug-bcom",
        level: "UG",
        name: "BACHELOR OF COMMERCE",
        fee: 12000,
        category: "Undergraduate",
        description: "Core accounting, finance, taxation, and business economics undergraduate degree."
    },
    {
        id: "ug-bcom-hons",
        level: "UG",
        name: "BACHELOR OF COMMERCE (HONORS)",
        fee: 17000,
        category: "Undergraduate",
        description: "Advanced specialized commerce program focusing on financial analytics and auditing."
    },
    {
        id: "ug-ba-jmc",
        level: "UG",
        name: "BACHELOR OF ARTS (JMC)",
        fee: 17000,
        category: "Undergraduate",
        description: "Journalism and Mass Communication program covering print, digital media, and broadcasting."
    },

    // Featured PG Programmes
    {
        id: "pg-pgdca",
        level: "PG",
        name: "PGDCA",
        fee: 28500,
        category: "Postgraduate",
        description: "Post Graduate Diploma in Computer Applications covering programming, database management, and web technology."
    },
    {
        id: "pg-ma-buddhist",
        level: "PG",
        name: "MASTER OF ARTS (BUDDHIST STUDIES)",
        fee: 17000,
        category: "Postgraduate",
        description: "Specialized postgraduate program in Buddhist philosophy, history, and literature."
    },
    {
        id: "pg-ma-edu",
        level: "PG",
        name: "MASTER OF ARTS (EDUCATION)",
        fee: 22000,
        category: "Postgraduate",
        description: "Advanced study in educational pedagogy, curriculum development, and administration."
    },
    {
        id: "pg-ma-pubadmin",
        level: "PG",
        name: "MASTER OF ARTS (PUBLIC ADMINISTRATION)",
        fee: 16500,
        category: "Postgraduate",
        description: "Postgraduate study of governance, public policy, administrative theory, and civil services."
    },
    {
        id: "pg-ma-homesci",
        level: "PG",
        name: "MASTER OF ARTS (HOME SCIENCE)",
        fee: 16500,
        category: "Postgraduate",
        description: "Advanced studies in resource management, human development, and food science."
    },
    {
        id: "pg-mlis",
        level: "PG",
        name: "MASTER OF LIBRARY AND INFORMATION SCIENCES",
        fee: 22000,
        category: "Postgraduate",
        description: "Master degree in modern library architecture, digital archiving, and information systems."
    },
    {
        id: "pg-mba",
        level: "PG",
        name: "MASTER OF BUSINESS ADMINISTRATION",
        fee: 32000,
        category: "Postgraduate",
        description: "Premier management program specializing in strategy, operations, marketing, and finance."
    },
    {
        id: "pg-mcom",
        level: "PG",
        name: "MASTER OF COMMERCE",
        fee: 18000,
        category: "Postgraduate",
        description: "Advanced post-graduate studies in corporate finance, taxation, and international trade."
    },
    {
        id: "pg-ma-jmc",
        level: "PG",
        name: "MASTER OF ARTS (JMC)",
        fee: 22000,
        category: "Postgraduate",
        description: "Master level training in investigative journalism, public relations, and new media production."
    },
    {
        id: "pg-ma-polsci",
        level: "PG",
        name: "MASTER OF ARTS (POLITICAL SCIENCES)",
        fee: 16500,
        category: "Postgraduate",
        description: "Comprehensive postgraduate study in international relations, political philosophy, and state politics."
    },
    {
        id: "pg-ma-math",
        level: "PG",
        name: "MASTER OF ARTS (MATHEMATICS)",
        fee: 16500,
        category: "Postgraduate",
        description: "Advanced mathematical analysis, algebra, statistics, and computational modeling."
    },
    {
        id: "pg-ma-soc",
        level: "PG",
        name: "MASTER OF ARTS (SOCIOLOGY)",
        fee: 16500,
        category: "Postgraduate",
        description: "Postgraduate research and training in social theory, cultural studies, and societal dynamics."
    },
    {
        id: "pg-ma-hist",
        level: "PG",
        name: "MASTER OF ARTS (HISTORY)",
        fee: 16500,
        category: "Postgraduate",
        description: "In-depth historical research covering Indian, world, and modern economic histories."
    },
    {
        id: "pg-ma-hindi",
        level: "PG",
        name: "MASTER OF ARTS (HINDI)",
        fee: 16500,
        category: "Postgraduate",
        description: "Advanced study of Hindi literature, linguistics, prose, and poetic traditions."
    },
    {
        id: "pg-ma-econ",
        level: "PG",
        name: "MASTER OF ARTS (ECONOMICS)",
        fee: 16500,
        category: "Postgraduate",
        description: "Advanced microeconomics, macroeconomics, econometrics, and policy development."
    },
    {
        id: "pg-ma-eng",
        level: "PG",
        name: "MASTER OF ARTS (ENGLISH)",
        fee: 16500,
        category: "Postgraduate",
        description: "Postgraduate studies in British, American, post-colonial literature, and critical theory."
    },
    {
        id: "pg-pgdca",
        level: "PG",
        name: "PGDCA",
        fee: 28500,
        category: "Postgraduate",
        description: "Post Graduate Diploma in Computer Applications covering programming, database management, and web technology."
    },

    // Diplomas & Certificates
    {
        id: "dip-ntt-1yr",
        level: "Diploma",
        name: "NTT (1 Year)",
        fee: 6000,
        category: "Teacher Training",
        description: "Nursery Teacher Training 1-Year Diploma for early childhood education professionals."
    },
    {
        id: "dip-ntt-2yr",
        level: "Diploma",
        name: "NTT (2 Years)",
        fee: 11000,
        category: "Teacher Training",
        description: "Comprehensive 2-Year Nursery Teacher Training Diploma covering advanced child psychology and teaching methods."
    },
    {
        id: "cert-olevel-elite",
        level: "Certificate",
        name: "O Level – ELITE Batch",
        fee: 2999,
        category: "Computer Certification",
        description: "Specialized intensive NIELIT O Level preparation batch with full practical and theory support."
    }
];
