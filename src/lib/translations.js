/**
 * SCAS Translations — English (en) & Hindi (hi)
 * Used across all dashboard components via the LanguageContext.
 */
const translations = {
  en: {
    // Navigation & Common
    signIn: 'Sign In',
    signOut: 'Sign Out',
    loading: 'Loading...',
    noData: 'No data found.',
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    resolve: '✅ Resolve',
    escalate: '⬆️ Escalate',

    // Login & Register
    signInTitle: 'Sign in to your account',
    phoneNumber: 'Phone Number',
    password: 'Password',
    newFarmer: 'New farmer?',
    registerHere: 'Register here',
    signingIn: 'Signing in...',
    inviteCode: 'Invite Code (Optional)',
    registerTitle: 'Create Farmer Account',
    alreadyRegistered: 'Already have an account?',
    demoNotice: '🧪 DEMO — Click to auto-fill',
    fullName: 'Full Name',
    village: 'Village',
    confirmPassword: 'Confirm Password',
    district: 'District',
    selectDistrict: 'Select District',
    register: 'Register',
    registering: 'Registering...',

    // Farmer Dashboard
    farmerDashboard: '🌱 Farmer Dashboard',
    welcomeBack: 'Welcome back',
    totalTickets: 'Total Tickets',
    resolved: 'Resolved',
    escalated: 'Escalated',
    myTickets: 'My Tickets',
    noTickets: 'No tickets yet. Submit your first crop issue above.',
    submitTicket: '+ Manually Type Ticket',
    closeForm: '✕ Close Form',

    // Worker Dashboard
    workerDashboard: '👷 Worker Dashboard',
    manageCases: 'Manage assigned farmer cases',
    activeCases: 'Active Cases',
    totalAssigned: 'Total Assigned',
    noCases: 'No active cases. All caught up! ✅',
    activeTickets: 'Active Cases',

    // Admin Dashboard
    adminDashboard: '🏛️ Admin Dashboard',
    monitoring: 'System-wide monitoring and notifications',
    totalTicketsAdmin: 'Total Tickets',
    escalatedGovt: 'Escalated to Govt',
    avgResolution: 'Avg Resolution',
    slaCompliance: 'SLA Compliance',
    registeredFarmers: 'Registered Farmers',
    bulkNotification: '📢 Bulk Notification',
    sendNotification: '🚀 Send Notification',
    sending: 'Sending...',
    issueCategories: 'Issue Categories',
    slaBreach: '🚨 Active SLA Breaches (Action Required)',
    assignedTo: 'Assigned To',

    // Chat / AI
    krishiMitraTitle: '🌾 Krishi Mitra AI',
    krishiMitraSubtitle: 'Your 24x7 Agricultural Expert',
    typeMessage: 'Type your farming question...',
    analyzing: 'Analyzing your concern...',
    send: 'Send',

    // Ticket Form
    ticketFormTitle: 'Submit a New Issue',
    describeIssue: 'Describe your crop issue in detail...',
    cropType: 'Crop Type (e.g. Wheat, Rice)',
    category: 'Category',
    priority: 'Priority',
    submitIssue: 'Submit Issue',

    // Weather
    weatherTitle: '🌦️ 7-Day Weather Forecast',
    weatherFetching: 'Detecting your location...',
    day: 'Day',
    humidity: 'Humidity',
    wind: 'Wind',

    // Notifications
    notificationTitle: 'Latest Updates',
    noNotifications: 'No new notifications 🌾',

    // Language Toggle
    toggleLang: 'हिन्दी',
  },

  hi: {
    // Navigation & Common
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    loading: 'लोड हो रहा है...',
    noData: 'कोई डेटा नहीं मिला।',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    save: 'सहेजें',
    resolve: '✅ हल करें',
    escalate: '⬆️ ऊपर भेजें',

    // Login & Register
    signInTitle: 'अपने खाते में साइन इन करें',
    phoneNumber: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    newFarmer: 'नए किसान हैं?',
    registerHere: 'यहाँ रजिस्टर करें',
    signingIn: 'साइन इन हो रहा है...',
    inviteCode: 'आमंत्रण कोड (वैकल्पिक)',
    registerTitle: 'किसान खाता बनाएं',
    alreadyRegistered: 'पहले से खाता है?',
    demoNotice: '🧪 डेमो — ऑटो-फिल के लिए क्लिक करें',
    fullName: 'पूरा नाम',
    village: 'गांव',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    district: 'जिला',
    selectDistrict: 'जिला चुनें',
    register: 'रजिस्टर करें',
    registering: 'रजिस्टर हो रहा है...',

    // Farmer Dashboard
    farmerDashboard: '🌱 किसान डैशबोर्ड',
    welcomeBack: 'वापसी पर स्वागत है',
    totalTickets: 'कुल शिकायतें',
    resolved: 'हल हुई',
    escalated: 'उच्च स्तर पर भेजी',
    myTickets: 'मेरी शिकायतें',
    noTickets: 'अभी कोई शिकायत नहीं। अपनी पहली समस्या ऊपर दर्ज करें।',
    submitTicket: '+ शिकायत दर्ज करें',
    closeForm: '✕ फ़ॉर्म बंद करें',

    // Worker Dashboard
    workerDashboard: '👷 कर्मचारी डैशबोर्ड',
    manageCases: 'किसानों के मामलों को संभालें',
    activeCases: 'सक्रिय मामले',
    totalAssigned: 'कुल सौंपे गए',
    noCases: 'कोई सक्रिय मामला नहीं। सब पूरा! ✅',
    activeTickets: 'सक्रिय मामले',

    // Admin Dashboard
    adminDashboard: '🏛️ सरकारी प्रशासन',
    monitoring: 'पूरे सिस्टम की निगरानी',
    totalTicketsAdmin: 'कुल शिकायतें',
    escalatedGovt: 'सरकार को भेजी',
    avgResolution: 'औसत समाधान समय',
    slaCompliance: 'SLA अनुपालन',
    registeredFarmers: 'पंजीकृत किसान',
    bulkNotification: '📢 सामूहिक सूचना',
    sendNotification: '🚀 सूचना भेजें',
    sending: 'भेजा जा रहा है...',
    issueCategories: 'समस्याओं की श्रेणियाँ',
    slaBreach: '🚨 SLA उल्लंघन (तुरंत कार्रवाई जरूरी)',
    assignedTo: 'सौंपा गया',

    // Chat / AI
    krishiMitraTitle: '🌾 कृषि मित्र AI',
    krishiMitraSubtitle: 'आपका 24x7 कृषि विशेषज्ञ',
    typeMessage: 'अपना सवाल यहाँ लिखें...',
    analyzing: 'आपकी समस्या का विश्लेषण हो रहा है...',
    send: 'भेजें',

    // Ticket Form
    ticketFormTitle: 'नई समस्या दर्ज करें',
    describeIssue: 'अपनी फसल की समस्या विस्तार से बताएं...',
    cropType: 'फसल का प्रकार (जैसे: गेहूँ, धान)',
    category: 'श्रेणी',
    priority: 'प्राथमिकता',
    submitIssue: 'समस्या दर्ज करें',

    // Weather
    weatherTitle: '🌦️ 7-दिन का मौसम पूर्वानुमान',
    weatherFetching: 'आपका स्थान पता कर रहे हैं...',
    day: 'दिन',
    humidity: 'आर्द्रता',
    wind: 'हवा',

    // Notifications
    notificationTitle: 'ताज़ा अपडेट',
    noNotifications: 'कोई नई सूचना नहीं 🌾',

    // Language Toggle
    toggleLang: 'English',
  },
};

export default translations;
