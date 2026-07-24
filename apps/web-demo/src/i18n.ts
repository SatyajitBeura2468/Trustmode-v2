import type { ScenarioId } from "@trustmode/core";
import type { Language } from "./state/DemoContext";

export interface ScenarioCopy {
  title: string;
  shortTitle: string;
  description: string;
  steps: string[];
  sectionTitle: string;
  sectionLead: string;
  protectedField: string;
  finalAction: string;
}

interface Messages {
  how: string; safety: string; accessibility: string; start: string;
  headline: string; support: string; tryDemo: string; seeHow: string; synthetic: string;
  nothing: string; private: string; review: string; approve: string; request: string; skip: string;
  preview: string; pause: string; resume: string; stop: string; ownerOnly: string; submit: string;
  languageLabel: string; largerText: string; simpleView: string; simpleViewOn: string;
  landing: {
    tableauAria: string; helper: string; helperLead: string; owner: string; ownerLead: string;
    privateExample: string; ownerOnly: string; suggestion: string; readyReview: string;
    reviewSuggestion: string; finalCall: string; approveContinue: string; howTitle: string;
    steps: Array<[string, string]>; momentsTitle: string; momentsLead: string; promise: string;
    exploreSafety: string; footer: string;
  };
  setup: {
    progress: [string, string, string]; sample: string; chooseTask: string; chooseLead: string;
    placeholder: string; privacyNote: string; interpret: string; matched: string; canChange: string;
    permissionsLabel: string; permissionsTitle: string; permissionsLead: string;
    modes: Record<"guide" | "together" | "prepare", [string, string]>;
    canTitle: string; canItems: string[]; cannotTitle: string; cannotItems: string[];
    controlTitle: string; controlBody: string; controlBadge: string; back: string;
    createInvitation: string; creatingInvitation: string; invitationLabel: string;
    invitationTitle: string; invitationLead: string; invitationReady: string; unavailable: string;
    expiresIn: string; oneHelper: string; linkReady: string; copyLink: string; copied: string;
    verificationCode: string; shareSeparately: string; openHelper: string; continueOwner: string;
    invitationNote: string; backPermissions: string;
  };
  helper: {
    loadingLabel: string; loadingTitle: string; loadingBody: string; unavailableLabel: string;
    unavailableTitle: string; unavailableBody: string; verifyLabel: string; verifyTitle: string;
    verifyLead: string; nameLabel: string; namePlaceholder: string; codeLabel: string;
    remaining: string; noAccount: string; suggestionsOnly: string; enter: string;
  };
  shared: {
    sampleSession: string; waitingForHelper: string; waitingLead: string; waitingStatus: string;
    joinedStatus: string; reconnecting: string; helpPaused: string; helpEnded: string;
    sessionComplete: string; youAreInControl: string; controlLeadWaiting: string;
    controlLeadActive: string; controlLeadPaused: string; pauseHelp: string; resumeHelp: string;
    endHelp: string; endTitle: string; endLead: string; keepHelping: string; endAccess: string;
    progressLabel: string; visibleOnlyYou: string; visibleOnlyOwner: string; whatHappening: string;
    noActivity: string; activityHelperSent: string; activityApplied: string; activityOwnerEdited: string;
    activityPaused: string; activityResumed: string; activityEnded: string; activityJoined: string;
    activityCompleted: string; suggestionHeading: string; suggestionLead: string; question: string;
    currentAnswer: string; suggestedAnswer: string; why: string; whatWillHappen: string;
    onlyThisAnswer: string; readSuggestion: string; approve: string; editMyself: string;
    reject: string; ownerEditLabel: string; saveMyAnswer: string; cancel: string;
    noSuggestionTitle: string; noSuggestionWaiting: string; noSuggestionNotJoined: string;
    addedByOwner: string; addedFromSuggestion: string; helpingWith: string; helperLead: string;
    suggestionInput: string; sendSuggestion: string; statusNotReady: string; statusReady: string;
    statusChecking: string; statusWaitingOwner: string; statusApproved: string; statusRejected: string;
    statusUpdate: string; statusAdded: string; statusBlocked: string; statusEnded: string;
    finalReview: string; finalReviewLead: string; finishSession: string; finalActionLead: string;
    completedTitle: string; completedLead: string; downloadSummary: string; noRealSubmission: string;
    helpedBy: string; noHelperJoined: string; fieldsCompleted: string; suggestionsWaiting: string;
    simpleHidden: string;
  };
  scenarios: Record<ScenarioId, ScenarioCopy>;
}

const en: Messages = {
  how: "How it works", safety: "Safety", accessibility: "Accessibility", start: "Start TrustMode",
  headline: "Digital help without surrendering control.",
  support: "Let someone help with the task while you keep the account, private details, and final decision.",
  tryDemo: "Start a practice session", seeHow: "See how it works",
  synthetic: "A working shared demo using sample information only.", nothing: "Nothing has changed yet",
  private: "Private details stay hidden", review: "Review suggestions", approve: "Approve and add",
  request: "Request change", skip: "Reject suggestion", preview: "Privacy and result preview",
  pause: "Pause", resume: "Resume", stop: "End session", ownerOnly: "Only you can do this",
  submit: "Submit application", languageLabel: "Language", largerText: "Larger text",
  simpleView: "Simple view", simpleViewOn: "Simple view on",
  landing: {
    tableauAria: "A helper suggests answers and the owner decides what is added",
    helper: "HELPER", helperLead: "Suggests permitted answers without entering your account",
    owner: "OWNER", ownerLead: "Reviews every suggestion and keeps final control",
    privateExample: "Private information", ownerOnly: "Owner only", suggestion: "Suggested answers",
    readyReview: "Ready for review", reviewSuggestion: "Review suggestion",
    finalCall: "You make the final call.", approveContinue: "Approve and continue",
    howTitle: "How it works in 3 simple steps.",
    steps: [
      ["The helper joins", "The invited person enters their own name and a separate verification code."],
      ["They suggest answers", "They can work only on permitted fields. Passwords, OTPs, payments, and final submission remain unavailable."],
      ["You decide", "You see the name they entered, review every change, and can pause or end access immediately."],
    ],
    momentsTitle: "Common moments where help matters.",
    momentsLead: "Try the same owner-controlled model across three sample services.",
    promise: "The helper may suggest answers, but never receives your account or the authority to submit.",
    exploreSafety: "Explore the safety model",
    footer: "Shared practice product · Sample workflows only · Final actions stay owner-only",
  },
  setup: {
    progress: ["Choose task", "Set limits", "Invite helper"], sample: "Sample practice session",
    chooseTask: "What would you like help with?",
    chooseLead: "Describe the task or choose a sample workflow. You decide exactly what the invited person may do.",
    placeholder: "For example: Help me prepare my scholarship application.",
    privacyNote: "Do not enter passwords, OTPs, payment details, or real identity numbers.",
    interpret: "Match task", matched: "Matched to", canChange: "You can change this before creating the invitation.",
    permissionsLabel: "Help permissions", permissionsTitle: "What the invited person can and cannot do.",
    permissionsLead: "This practice session uses sample information and does not submit anything to a real organisation.",
    modes: {
      guide: ["Guide me", "The helper explains each step. You perform every action."],
      together: ["Do it with me", "The helper suggests answers. You approve them one by one."],
      prepare: ["Prepare suggestions", "The helper prepares all permitted answers before your review."],
    },
    canTitle: "The invited person can",
    canItems: ["Suggest answers", "Point out missing information", "Explain confusing questions", "Send changes for your approval"],
    cannotTitle: "The invited person cannot",
    cannotItems: ["See your password or OTP", "Make a payment", "Submit the final form", "Continue after you pause or end help"],
    controlTitle: "You remain in control.",
    controlBody: "Nothing is added until you approve it. Unknown or sensitive actions are blocked before review.",
    controlBadge: "Owner approval required", back: "Back", createInvitation: "Create secure invitation",
    creatingInvitation: "Creating invitation…", invitationLabel: "Secure invitation",
    invitationTitle: "Invite someone you trust.",
    invitationLead: "The link opens only this practice task. The person must enter their own name and the separate verification code.",
    invitationReady: "Invitation ready", unavailable: "Help session unavailable", expiresIn: "Expires in",
    oneHelper: "One verified helper", linkReady: "Invitation link ready to share", copyLink: "Copy link",
    copied: "Copied", verificationCode: "Verification code",
    shareSeparately: "Share this code separately from the link.", openHelper: "Open helper page",
    continueOwner: "Continue as owner",
    invitationNote: "The owner page waits until a real person joins. It never invents or preselects a helper name.",
    backPermissions: "Back to permissions",
  },
  helper: {
    loadingLabel: "Opening protected help page", loadingTitle: "Checking the invitation.",
    loadingBody: "TrustMode is loading only the fields you are allowed to help with.",
    unavailableLabel: "Invitation unavailable", unavailableTitle: "This helper link cannot be used.",
    unavailableBody: "It may have expired, been ended, or been replaced. Ask the owner for a new link.",
    verifyLabel: "Helper verification", verifyTitle: "Enter your name and the code.",
    verifyLead: "Your entered name appears to the owner only after the code is verified. This does not verify legal identity.",
    nameLabel: "Your name", namePlaceholder: "Enter the name the owner knows you by",
    codeLabel: "Six-digit verification code", remaining: "remaining", noAccount: "No account access",
    suggestionsOnly: "Suggestions only", enter: "Verify and enter",
  },
  shared: {
    sampleSession: "sample practice session", waitingForHelper: "Waiting for the invited person to join",
    waitingLead: "Share the link and code. This screen updates when a real person enters their name and verifies the invitation.",
    waitingStatus: "Waiting for helper", joinedStatus: "joined", reconnecting: "Reconnecting",
    helpPaused: "Help paused", helpEnded: "Help ended", sessionComplete: "Session complete",
    youAreInControl: "You are in control", controlLeadWaiting: "No helper has joined. Nothing can be suggested yet.",
    controlLeadActive: "The helper can suggest answers. You decide what is added.",
    controlLeadPaused: "The helper cannot send suggestions until you resume.", pauseHelp: "Pause help",
    resumeHelp: "Resume help", endHelp: "End help", endTitle: "End this person’s access?",
    endLead: "They will immediately lose access. Your sample answers remain available to you.",
    keepHelping: "Keep access", endAccess: "End access", progressLabel: "Form progress",
    visibleOnlyYou: "Visible only to you", visibleOnlyOwner: "Visible only to the owner",
    whatHappening: "What is happening", noActivity: "No activity yet. A real helper appears here only after verification.",
    activityHelperSent: "sent a suggestion for review.", activityApplied: "added an approved answer to the form.",
    activityOwnerEdited: "entered an answer directly.", activityPaused: "paused help.",
    activityResumed: "resumed help.", activityEnded: "ended helper access.",
    activityJoined: "joined the help session.", activityCompleted: "finished the practice session.",
    suggestionHeading: "suggested a change", suggestionLead: "Review one answer at a time. Nothing is submitted from this screen.",
    question: "Question", currentAnswer: "Current answer", suggestedAnswer: "Suggested answer", why: "Why",
    whatWillHappen: "What will happen", onlyThisAnswer: "Only this answer will be filled. The form will not be submitted.",
    readSuggestion: "Read this suggestion aloud", approve: "Approve", editMyself: "Enter my own answer",
    reject: "Reject", ownerEditLabel: "Enter the answer you want to use", saveMyAnswer: "Save my answer",
    cancel: "Cancel", noSuggestionTitle: "No suggestion is waiting right now.",
    noSuggestionWaiting: "The helper is preparing an answer. This page updates automatically.",
    noSuggestionNotJoined: "No one has joined yet. The page is waiting instead of inventing a person.",
    addedByOwner: "You entered this answer.", addedFromSuggestion: "The approved suggestion was added.",
    helpingWith: "You are helping with", helperLead: "Enter or adjust a suggested answer. The owner decides whether it is added.",
    suggestionInput: "Suggested answer", sendSuggestion: "Send suggestion", statusNotReady: "Not ready",
    statusReady: "Ready to suggest", statusChecking: "Checking", statusWaitingOwner: "Waiting for owner",
    statusApproved: "Owner approved", statusRejected: "Owner rejected", statusUpdate: "Please update",
    statusAdded: "Added to form", statusBlocked: "Blocked for safety", statusEnded: "Help ended",
    finalReview: "Review the current answers",
    finalReviewLead: "These are the answers currently saved in this sample form. The final action remains yours alone.",
    finishSession: "Finish practice session",
    finalActionLead: "TrustMode does not press the real submit, booking, or payment button.",
    completedTitle: "Practice session finished",
    completedLead: "The helper’s access has ended. No real application, registration, booking, or payment was made.",
    downloadSummary: "Download session summary", noRealSubmission: "No real form was submitted.",
    helpedBy: "Helped by", noHelperJoined: "No helper joined", fieldsCompleted: "answers completed",
    suggestionsWaiting: "suggestions waiting", simpleHidden: "Extra activity detail is hidden in Simple view.",
  },
  scenarios: {
    scholarship: {
      title: "Scholarship application", shortTitle: "Scholarship",
      description: "Prepare education and eligibility details without exposing identity documents.",
      steps: ["Invite helper", "Education answers", "Review answers", "Session summary"],
      sectionTitle: "Education details", sectionLead: "Check each answer carefully. You can enter any answer yourself.",
      protectedField: "Aadhaar number", finalAction: "Submit scholarship application",
    },
    hospital: {
      title: "Hospital registration", shortTitle: "Hospital registration",
      description: "Prepare an appointment while medical records and identity values remain private.",
      steps: ["Invite helper", "Appointment answers", "Review answers", "Session summary"],
      sectionTitle: "Appointment details", sectionLead: "Review the department, visit type, and language support.",
      protectedField: "Patient identification number", finalAction: "Confirm hospital registration",
    },
    admission: {
      title: "College admission", shortTitle: "College admission",
      description: "Prepare course choices and education details without sharing raw certificates.",
      steps: ["Invite helper", "Course answers", "Review answers", "Session summary"],
      sectionTitle: "Course choices", sectionLead: "Review the programme, qualifying board, and hostel preference.",
      protectedField: "Aadhaar number", finalAction: "Submit college application",
    },
  },
};

const hi: Messages = {
  ...en,
  how: "यह कैसे काम करता है", safety: "सुरक्षा", accessibility: "सुगम्यता", start: "TrustMode शुरू करें",
  headline: "नियंत्रण छोड़े बिना डिजिटल सहायता।",
  support: "किसी को काम में मदद करने दें, जबकि खाता, निजी जानकारी और अंतिम निर्णय आपके पास रहें।",
  tryDemo: "अभ्यास सत्र शुरू करें", seeHow: "तरीका देखें", synthetic: "केवल नमूना जानकारी के साथ काम करने वाला साझा डेमो।",
  languageLabel: "भाषा", largerText: "बड़ा टेक्स्ट", simpleView: "सरल दृश्य", simpleViewOn: "सरल दृश्य चालू",
  setup: {
    ...en.setup, progress: ["काम चुनें", "सीमाएँ तय करें", "सहायक बुलाएँ"], sample: "नमूना अभ्यास सत्र",
    chooseTask: "आप किस काम में मदद चाहते हैं?", chooseLead: "काम बताएँ या नमूना प्रक्रिया चुनें। आप तय करेंगे कि बुलाया गया व्यक्ति क्या कर सकता है।",
    placeholder: "उदाहरण: मेरी छात्रवृत्ति आवेदन तैयार करने में मदद करें।",
    privacyNote: "पासवर्ड, OTP, भुगतान विवरण या असली पहचान संख्या न लिखें।", interpret: "काम मिलाएँ",
    matched: "इससे मिलाया गया", canChange: "निमंत्रण बनाने से पहले इसे बदल सकते हैं।",
    permissionsLabel: "मदद की अनुमति", permissionsTitle: "बुलाया गया व्यक्ति क्या कर सकता है और क्या नहीं।",
    permissionsLead: "यह अभ्यास नमूना जानकारी का उपयोग करता है और किसी असली संस्था को कुछ जमा नहीं करता।",
    modes: { guide: ["मुझे समझाएँ", "सहायक हर चरण समझाएगा। काम आप करेंगे।"], together: ["मेरे साथ करें", "सहायक उत्तर सुझाएगा। आप एक-एक करके मंज़ूर करेंगे।"], prepare: ["सुझाव तैयार करें", "सहायक समीक्षा से पहले सभी अनुमत उत्तर तैयार करेगा।"] },
    canTitle: "बुलाया गया व्यक्ति कर सकता है", canItems: ["उत्तर सुझाना", "छूटी जानकारी बताना", "उलझे प्रश्न समझाना", "आपकी मंज़ूरी के लिए बदलाव भेजना"],
    cannotTitle: "बुलाया गया व्यक्ति नहीं कर सकता", cannotItems: ["आपका पासवर्ड या OTP देखना", "भुगतान करना", "अंतिम फॉर्म जमा करना", "आपके रोकने के बाद जारी रखना"],
    controlTitle: "नियंत्रण आपके पास रहता है।", controlBody: "आपकी मंज़ूरी के बिना कुछ नहीं जुड़ता। संवेदनशील काम पहले ही रोक दिए जाते हैं।",
    controlBadge: "मालिक की मंज़ूरी आवश्यक", back: "पीछे", createInvitation: "सुरक्षित निमंत्रण बनाएँ", creatingInvitation: "निमंत्रण बन रहा है…",
    invitationLabel: "सुरक्षित निमंत्रण", invitationTitle: "किसी भरोसेमंद व्यक्ति को बुलाएँ।",
    invitationLead: "लिंक केवल यह अभ्यास काम खोलता है। व्यक्ति को अपना नाम और अलग सत्यापन कोड लिखना होगा।",
    invitationReady: "निमंत्रण तैयार", unavailable: "मदद सत्र उपलब्ध नहीं", expiresIn: "समाप्त होने में", oneHelper: "एक सत्यापित सहायक",
    linkReady: "साझा करने के लिए लिंक तैयार", copyLink: "लिंक कॉपी करें", copied: "कॉपी हुआ", verificationCode: "सत्यापन कोड",
    shareSeparately: "कोड को लिंक से अलग भेजें।", openHelper: "सहायक पेज खोलें", continueOwner: "मालिक के रूप में जारी रखें",
    invitationNote: "मालिक का पेज असली व्यक्ति के जुड़ने तक प्रतीक्षा करेगा। कोई नाम अपने आप नहीं चुना जाएगा।", backPermissions: "अनुमतियों पर वापस जाएँ",
  },
  helper: {
    ...en.helper, loadingLabel: "सुरक्षित मदद पेज खुल रहा है", loadingTitle: "निमंत्रण जाँचा जा रहा है।",
    loadingBody: "TrustMode केवल वही फ़ील्ड खोल रहा है जिनमें आप मदद कर सकते हैं।", unavailableLabel: "निमंत्रण उपलब्ध नहीं",
    unavailableTitle: "यह सहायक लिंक उपयोग नहीं किया जा सकता।", unavailableBody: "यह समाप्त या बंद हो चुका हो सकता है। मालिक से नया लिंक माँगें।",
    verifyLabel: "सहायक सत्यापन", verifyTitle: "अपना नाम और कोड लिखें।",
    verifyLead: "कोड सही होने के बाद ही आपका लिखा नाम मालिक को दिखेगा। यह कानूनी पहचान सत्यापन नहीं है।",
    nameLabel: "आपका नाम", namePlaceholder: "वह नाम लिखें जिससे मालिक आपको जानता है", codeLabel: "छह अंकों का सत्यापन कोड",
    remaining: "शेष", noAccount: "खाते की पहुँच नहीं", suggestionsOnly: "केवल सुझाव", enter: "सत्यापित करके प्रवेश करें",
  },
  shared: {
    ...en.shared, sampleSession: "नमूना अभ्यास सत्र", waitingForHelper: "बुलाए गए व्यक्ति के जुड़ने की प्रतीक्षा",
    waitingLead: "लिंक और कोड भेजें। असली व्यक्ति नाम लिखकर सत्यापन करेगा, तब यह स्क्रीन अपने आप बदलेगी।",
    waitingStatus: "सहायक की प्रतीक्षा", joinedStatus: "जुड़ गए", reconnecting: "फिर से जुड़ रहा है", helpPaused: "मदद रुकी है",
    helpEnded: "मदद समाप्त", sessionComplete: "सत्र पूरा", youAreInControl: "नियंत्रण आपके पास है",
    controlLeadWaiting: "कोई सहायक नहीं जुड़ा है। अभी कोई सुझाव नहीं भेजा जा सकता।",
    controlLeadActive: "सहायक उत्तर सुझा सकता है। क्या जोड़ा जाए, यह आप तय करते हैं।", controlLeadPaused: "आपके फिर शुरू करने तक सहायक सुझाव नहीं भेज सकता।",
    pauseHelp: "मदद रोकें", resumeHelp: "मदद जारी करें", endHelp: "मदद समाप्त करें", endTitle: "इस व्यक्ति की पहुँच समाप्त करें?",
    endLead: "उनकी पहुँच तुरंत बंद हो जाएगी। आपके नमूना उत्तर सुरक्षित रहेंगे।", keepHelping: "पहुँच रखें", endAccess: "पहुँच समाप्त करें",
    progressLabel: "फॉर्म प्रगति", visibleOnlyYou: "केवल आपको दिखाई देता है", visibleOnlyOwner: "केवल मालिक को दिखाई देता है",
    whatHappening: "क्या हो रहा है", noActivity: "अभी कोई गतिविधि नहीं। सत्यापन के बाद ही असली सहायक यहाँ दिखेगा।",
    suggestionHeading: "ने बदलाव सुझाया", suggestionLead: "एक समय में एक उत्तर जाँचें। इस स्क्रीन से कुछ जमा नहीं होता।",
    question: "प्रश्न", currentAnswer: "वर्तमान उत्तर", suggestedAnswer: "सुझाया उत्तर", why: "क्यों", whatWillHappen: "क्या होगा",
    onlyThisAnswer: "केवल यह उत्तर भरेगा। फॉर्म जमा नहीं होगा।", approve: "मंज़ूर करें", editMyself: "अपना उत्तर लिखें", reject: "अस्वीकार करें",
    ownerEditLabel: "वह उत्तर लिखें जिसे आप उपयोग करना चाहते हैं", saveMyAnswer: "मेरा उत्तर सहेजें", cancel: "रद्द करें",
    noSuggestionTitle: "अभी कोई सुझाव प्रतीक्षा में नहीं है।", noSuggestionWaiting: "सहायक उत्तर तैयार कर रहा है। यह पेज अपने आप बदलेगा।",
    noSuggestionNotJoined: "अभी कोई नहीं जुड़ा है। पेज कोई काल्पनिक व्यक्ति नहीं दिखा रहा।", helpingWith: "आप इसमें मदद कर रहे हैं",
    helperLead: "सुझाया उत्तर लिखें या बदलें। मालिक तय करेगा कि इसे जोड़ा जाए या नहीं।", suggestionInput: "सुझाया उत्तर", sendSuggestion: "सुझाव भेजें",
    finalReview: "वर्तमान उत्तर जाँचें", finalReviewLead: "ये नमूना फॉर्म में सहेजे गए उत्तर हैं। अंतिम काम केवल आप कर सकते हैं।",
    finishSession: "अभ्यास सत्र समाप्त करें", finalActionLead: "TrustMode असली जमा, बुकिंग या भुगतान बटन नहीं दबाता।",
    completedTitle: "अभ्यास सत्र पूरा हुआ", completedLead: "सहायक की पहुँच समाप्त है। कोई असली आवेदन, पंजीकरण, बुकिंग या भुगतान नहीं हुआ।",
    downloadSummary: "सत्र सारांश डाउनलोड करें", noRealSubmission: "कोई असली फॉर्म जमा नहीं हुआ।", helpedBy: "मदद की",
    noHelperJoined: "कोई सहायक नहीं जुड़ा", fieldsCompleted: "उत्तर पूरे", suggestionsWaiting: "सुझाव प्रतीक्षा में", simpleHidden: "सरल दृश्य में अतिरिक्त गतिविधि छिपी है।",
  },
  scenarios: {
    scholarship: { title: "छात्रवृत्ति आवेदन", shortTitle: "छात्रवृत्ति", description: "पहचान दस्तावेज़ दिखाए बिना शिक्षा और पात्रता विवरण तैयार करें।", steps: ["सहायक को बुलाएँ", "शिक्षा के उत्तर", "उत्तर जाँचें", "सत्र सारांश"], sectionTitle: "शिक्षा विवरण", sectionLead: "हर उत्तर ध्यान से जाँचें। आप स्वयं कोई भी उत्तर लिख सकते हैं।", protectedField: "आधार संख्या", finalAction: "छात्रवृत्ति आवेदन जमा करें" },
    hospital: { title: "अस्पताल पंजीकरण", shortTitle: "अस्पताल पंजीकरण", description: "मेडिकल रिकॉर्ड और पहचान जानकारी निजी रखते हुए अपॉइंटमेंट तैयार करें।", steps: ["सहायक को बुलाएँ", "अपॉइंटमेंट उत्तर", "उत्तर जाँचें", "सत्र सारांश"], sectionTitle: "अपॉइंटमेंट विवरण", sectionLead: "विभाग, विज़िट प्रकार और भाषा सहायता जाँचें।", protectedField: "रोगी पहचान संख्या", finalAction: "अस्पताल पंजीकरण की पुष्टि करें" },
    admission: { title: "कॉलेज प्रवेश", shortTitle: "कॉलेज प्रवेश", description: "मूल प्रमाणपत्र साझा किए बिना पाठ्यक्रम और शिक्षा विवरण तैयार करें।", steps: ["सहायक को बुलाएँ", "पाठ्यक्रम उत्तर", "उत्तर जाँचें", "सत्र सारांश"], sectionTitle: "पाठ्यक्रम चयन", sectionLead: "पाठ्यक्रम, बोर्ड और हॉस्टल पसंद जाँचें।", protectedField: "आधार संख्या", finalAction: "कॉलेज आवेदन जमा करें" },
  },
};

const or: Messages = {
  ...en,
  how: "ଏହା କିପରି କାମ କରେ", safety: "ସୁରକ୍ଷା", accessibility: "ସୁଗମତା", start: "TrustMode ଆରମ୍ଭ କରନ୍ତୁ",
  headline: "ନିୟନ୍ତ୍ରଣ ନ ହରାଇ ଡିଜିଟାଲ ସହାୟତା।",
  support: "କାହାକୁ କାମରେ ସାହାଯ୍ୟ କରିବାକୁ ଦିଅନ୍ତୁ, କିନ୍ତୁ ଖାତା, ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ଓ ଶେଷ ନିଷ୍ପତ୍ତି ଆପଣଙ୍କ ପାଖରେ ରହିବ।",
  tryDemo: "ଅଭ୍ୟାସ ସେସନ୍ ଆରମ୍ଭ କରନ୍ତୁ", seeHow: "କିପରି କାମ କରେ ଦେଖନ୍ତୁ",
  synthetic: "କେବଳ ନମୁନା ତଥ୍ୟ ସହ କାମ କରୁଥିବା ସେୟାର୍ଡ ଡେମୋ।", languageLabel: "ଭାଷା",
  largerText: "ବଡ଼ ଅକ୍ଷର", simpleView: "ସରଳ ଦୃଶ୍ୟ", simpleViewOn: "ସରଳ ଦୃଶ୍ୟ ଚାଲୁ",
  setup: {
    ...en.setup, progress: ["କାମ ବାଛନ୍ତୁ", "ସୀମା ଧାର୍ଯ୍ୟ କରନ୍ତୁ", "ସହାୟକଙ୍କୁ ଡାକନ୍ତୁ"], sample: "ନମୁନା ଅଭ୍ୟାସ ସେସନ୍",
    chooseTask: "ଆପଣ କେଉଁ କାମରେ ସାହାଯ୍ୟ ଚାହୁଁଛନ୍ତି?", chooseLead: "କାମଟି କୁହନ୍ତୁ କିମ୍ବା ଏକ ନମୁନା ପ୍ରକ୍ରିୟା ବାଛନ୍ତୁ। କିଏ କଣ କରିପାରିବେ ଆପଣ ନିଷ୍ପତ୍ତି ନେବେ।",
    placeholder: "ଉଦାହରଣ: ମୋର ସ୍କଲାରଶିପ୍ ଆବେଦନ ପ୍ରସ୍ତୁତ କରିବାରେ ସାହାଯ୍ୟ କରନ୍ତୁ।",
    privacyNote: "ପାସୱାର୍ଡ, OTP, ପେମେଣ୍ଟ ତଥ୍ୟ କିମ୍ବା ପ୍ରକୃତ ପରିଚୟ ସଂଖ୍ୟା ଲେଖନ୍ତୁ ନାହିଁ।",
    interpret: "କାମ ମେଳାନ୍ତୁ", matched: "ଏହା ସହ ମେଳିଲା", canChange: "ଆମନ୍ତ୍ରଣ ପୂର୍ବରୁ ବଦଳାଇପାରିବେ।",
    permissionsLabel: "ସାହାଯ୍ୟ ଅନୁମତି", permissionsTitle: "ଆମନ୍ତ୍ରିତ ବ୍ୟକ୍ତି କଣ କରିପାରିବେ ଓ କଣ କରିପାରିବେ ନାହିଁ।",
    permissionsLead: "ଏହି ଅଭ୍ୟାସ ନମୁନା ତଥ୍ୟ ବ୍ୟବହାର କରେ ଏବଂ କୌଣସି ପ୍ରକୃତ ସଂସ୍ଥାକୁ କିଛି ଦାଖଲ କରେ ନାହିଁ।",
    modes: { guide: ["ମୋତେ ବୁଝାନ୍ତୁ", "ସହାୟକ ପ୍ରତ୍ୟେକ ପଦକ୍ଷେପ ବୁଝାଇବେ। କାମ ଆପଣ କରିବେ।"], together: ["ମୋ ସହ କରନ୍ତୁ", "ସହାୟକ ଉତ୍ତର ସୁପାରିଶ କରିବେ। ଆପଣ ଅନୁମୋଦନ କରିବେ।"], prepare: ["ସୁପାରିଶ ପ୍ରସ୍ତୁତ କରନ୍ତୁ", "ସମୀକ୍ଷା ପୂର୍ବରୁ ସମସ୍ତ ଅନୁମୋଦିତ ଉତ୍ତର ପ୍ରସ୍ତୁତ ହେବ।"] },
    canTitle: "ଆମନ୍ତ୍ରିତ ବ୍ୟକ୍ତି ପାରିବେ", canItems: ["ଉତ୍ତର ସୁପାରିଶ କରିବା", "ଅଭାବ ତଥ୍ୟ କୁହିବା", "ଅସ୍ପଷ୍ଟ ପ୍ରଶ୍ନ ବୁଝାଇବା", "ଅନୁମୋଦନ ପାଇଁ ପରିବର୍ତ୍ତନ ପଠାଇବା"],
    cannotTitle: "ଆମନ୍ତ୍ରିତ ବ୍ୟକ୍ତି ପାରିବେ ନାହିଁ", cannotItems: ["ପାସୱାର୍ଡ କିମ୍ବା OTP ଦେଖିବା", "ପେମେଣ୍ଟ କରିବା", "ଶେଷ ଫର୍ମ ଦାଖଲ କରିବା", "ଆପଣ ବନ୍ଦ କରିବା ପରେ ଜାରି ରଖିବା"],
    controlTitle: "ନିୟନ୍ତ୍ରଣ ଆପଣଙ୍କ ପାଖରେ।", controlBody: "ଆପଣଙ୍କ ଅନୁମୋଦନ ବିନା କିଛି ଯୋଡ଼ାଯାଏ ନାହିଁ। ସମ୍ବେଦନଶୀଳ କାମ ବନ୍ଦ ହୁଏ।",
    controlBadge: "ମାଲିକଙ୍କ ଅନୁମୋଦନ ଆବଶ୍ୟକ", back: "ପଛକୁ", createInvitation: "ସୁରକ୍ଷିତ ଆମନ୍ତ୍ରଣ ତିଆରି କରନ୍ତୁ",
    creatingInvitation: "ଆମନ୍ତ୍ରଣ ତିଆରି ହେଉଛି…", invitationLabel: "ସୁରକ୍ଷିତ ଆମନ୍ତ୍ରଣ", invitationTitle: "ଭରସାଯୋଗ୍ୟ ବ୍ୟକ୍ତିଙ୍କୁ ଡାକନ୍ତୁ।",
    invitationLead: "ଲିଙ୍କ୍ କେବଳ ଏହି ଅଭ୍ୟାସ କାମ ଖୋଲିବ। ବ୍ୟକ୍ତି ନିଜ ନାମ ଏବଂ ଅଲଗା ଯାଞ୍ଚ କୋଡ୍ ଲେଖିବେ।",
    invitationReady: "ଆମନ୍ତ୍ରଣ ପ୍ରସ୍ତୁତ", unavailable: "ସାହାଯ୍ୟ ସେସନ୍ ଉପଲବ୍ଧ ନୁହେଁ", expiresIn: "ସମାପ୍ତ ହେବାକୁ",
    oneHelper: "ଜଣେ ଯାଞ୍ଚିତ ସହାୟକ", linkReady: "ସେୟାର୍ କରିବାକୁ ଲିଙ୍କ୍ ପ୍ରସ୍ତୁତ", copyLink: "ଲିଙ୍କ୍ କପି କରନ୍ତୁ",
    copied: "କପି ହେଲା", verificationCode: "ଯାଞ୍ଚ କୋଡ୍", shareSeparately: "କୋଡ୍‌ଟି ଲିଙ୍କ୍‌ରୁ ଅଲଗା ପଠାନ୍ତୁ।",
    openHelper: "ସହାୟକ ପୃଷ୍ଠା ଖୋଲନ୍ତୁ", continueOwner: "ମାଲିକ ଭାବେ ଜାରି ରଖନ୍ତୁ",
    invitationNote: "ପ୍ରକୃତ ବ୍ୟକ୍ତି ଯୋଗ ନଦେଉଅବଧି ମାଲିକ ପୃଷ୍ଠା ଅପେକ୍ଷା କରିବ। କୌଣସି ନାମ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଦେଖାଯିବ ନାହିଁ।",
    backPermissions: "ଅନୁମତିକୁ ଫେରନ୍ତୁ",
  },
  helper: {
    ...en.helper, loadingLabel: "ସୁରକ୍ଷିତ ସାହାଯ୍ୟ ପୃଷ୍ଠା ଖୋଲୁଛି", loadingTitle: "ଆମନ୍ତ୍ରଣ ଯାଞ୍ଚ ହେଉଛି।",
    loadingBody: "TrustMode କେବଳ ଆପଣ ସାହାଯ୍ୟ କରିପାରୁଥିବା ଫିଲ୍ଡ ଖୋଲୁଛି।", unavailableLabel: "ଆମନ୍ତ୍ରଣ ଉପଲବ୍ଧ ନୁହେଁ",
    unavailableTitle: "ଏହି ସହାୟକ ଲିଙ୍କ୍ ବ୍ୟବହାର କରାଯାଇପାରିବ ନାହିଁ।", unavailableBody: "ଏହା ସମାପ୍ତ କିମ୍ବା ବନ୍ଦ ହୋଇଥାଇପାରେ। ନୂଆ ଲିଙ୍କ୍ ମାଗନ୍ତୁ।",
    verifyLabel: "ସହାୟକ ଯାଞ୍ଚ", verifyTitle: "ନିଜ ନାମ ଓ କୋଡ୍ ଲେଖନ୍ତୁ।",
    verifyLead: "କୋଡ୍ ଯାଞ୍ଚ ହେବା ପରେ ମାତ୍ର ଆପଣଙ୍କ ଲେଖା ନାମ ମାଲିକଙ୍କୁ ଦେଖାଯିବ। ଏହା ଆଇନଗତ ପରିଚୟ ଯାଞ୍ଚ ନୁହେଁ।",
    nameLabel: "ଆପଣଙ୍କ ନାମ", namePlaceholder: "ମାଲିକ ଯେଉଁ ନାମରେ ଆପଣଙ୍କୁ ଜାଣନ୍ତି ସେହି ନାମ ଲେଖନ୍ତୁ",
    codeLabel: "ଛଅ ଅଙ୍କର ଯାଞ୍ଚ କୋଡ୍", remaining: "ବାକି", noAccount: "ଖାତା ପ୍ରବେଶ ନାହିଁ", suggestionsOnly: "କେବଳ ସୁପାରିଶ",
    enter: "ଯାଞ୍ଚ କରି ପ୍ରବେଶ କରନ୍ତୁ",
  },
  shared: {
    ...en.shared, sampleSession: "ନମୁନା ଅଭ୍ୟାସ ସେସନ୍", waitingForHelper: "ଆମନ୍ତ୍ରିତ ବ୍ୟକ୍ତି ଯୋଗଦେବାକୁ ଅପେକ୍ଷା",
    waitingLead: "ଲିଙ୍କ୍ ଓ କୋଡ୍ ପଠାନ୍ତୁ। ପ୍ରକୃତ ବ୍ୟକ୍ତି ନାମ ଲେଖି ଯାଞ୍ଚ କଲେ ଏହି ପୃଷ୍ଠା ସ୍ୱୟଂଚାଳିତ ଭାବେ ବଦଳିବ।",
    waitingStatus: "ସହାୟକଙ୍କୁ ଅପେକ୍ଷା", joinedStatus: "ଯୋଗଦେଲେ", reconnecting: "ପୁଣି ଯୋଡ଼ାଯାଉଛି", helpPaused: "ସାହାଯ୍ୟ ବିରତ",
    helpEnded: "ସାହାଯ୍ୟ ସମାପ୍ତ", sessionComplete: "ସେସନ୍ ସମ୍ପୂର୍ଣ୍ଣ", youAreInControl: "ନିୟନ୍ତ୍ରଣ ଆପଣଙ୍କ ପାଖରେ",
    controlLeadWaiting: "କୌଣସି ସହାୟକ ଯୋଗ ଦେଇନାହାନ୍ତି। ଏବେ କୌଣସି ସୁପାରିଶ ପଠାଯାଇପାରିବ ନାହିଁ।",
    controlLeadActive: "ସହାୟକ ଉତ୍ତର ସୁପାରିଶ କରିପାରିବେ। କଣ ଯୋଡ଼ାଯିବ ଆପଣ ନିଷ୍ପତ୍ତି ନେବେ।",
    controlLeadPaused: "ଆପଣ ପୁଣି ଆରମ୍ଭ କରିବା ପର୍ଯ୍ୟନ୍ତ ସହାୟକ ସୁପାରିଶ ପଠାଇପାରିବେ ନାହିଁ।",
    pauseHelp: "ସାହାଯ୍ୟ ବିରତ କରନ୍ତୁ", resumeHelp: "ସାହାଯ୍ୟ ଜାରି କରନ୍ତୁ", endHelp: "ସାହାଯ୍ୟ ସମାପ୍ତ କରନ୍ତୁ",
    endTitle: "ଏହି ବ୍ୟକ୍ତିଙ୍କ ପ୍ରବେଶ ସମାପ୍ତ କରିବେ?", endLead: "ତାଙ୍କ ପ୍ରବେଶ ତୁରନ୍ତ ବନ୍ଦ ହେବ। ଆପଣଙ୍କ ନମୁନା ଉତ୍ତର ରହିବ।",
    keepHelping: "ପ୍ରବେଶ ରଖନ୍ତୁ", endAccess: "ପ୍ରବେଶ ସମାପ୍ତ କରନ୍ତୁ", progressLabel: "ଫର୍ମ ପ୍ରଗତି",
    visibleOnlyYou: "କେବଳ ଆପଣଙ୍କୁ ଦେଖାଯାଏ", visibleOnlyOwner: "କେବଳ ମାଲିକଙ୍କୁ ଦେଖାଯାଏ", whatHappening: "କଣ ଘଟୁଛି",
    noActivity: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି କାର୍ଯ୍ୟ ନାହିଁ। ଯାଞ୍ଚ ପରେ ମାତ୍ର ପ୍ରକୃତ ସହାୟକ ଏଠାରେ ଦେଖାଯିବେ।",
    suggestionHeading: "ପରିବର୍ତ୍ତନ ସୁପାରିଶ କଲେ", suggestionLead: "ଗୋଟିଏ ସମୟରେ ଗୋଟିଏ ଉତ୍ତର ଯାଞ୍ଚ କରନ୍ତୁ। ଏହି ପୃଷ୍ଠାରୁ କିଛି ଦାଖଲ ହୁଏ ନାହିଁ।",
    question: "ପ୍ରଶ୍ନ", currentAnswer: "ବର୍ତ୍ତମାନ ଉତ୍ତର", suggestedAnswer: "ସୁପାରିଶ ଉତ୍ତର", why: "କାହିଁକି", whatWillHappen: "କଣ ହେବ",
    onlyThisAnswer: "କେବଳ ଏହି ଉତ୍ତର ଭରାଯିବ। ଫର୍ମ ଦାଖଲ ହେବ ନାହିଁ।", approve: "ଅନୁମୋଦନ କରନ୍ତୁ", editMyself: "ମୋ ଉତ୍ତର ଲେଖିବି",
    reject: "ଅସ୍ୱୀକାର କରନ୍ତୁ", ownerEditLabel: "ଆପଣ ବ୍ୟବହାର କରିବାକୁ ଚାହୁଁଥିବା ଉତ୍ତର ଲେଖନ୍ତୁ", saveMyAnswer: "ମୋ ଉତ୍ତର ସଞ୍ଚୟ କରନ୍ତୁ",
    cancel: "ବାତିଲ୍", noSuggestionTitle: "ଏବେ କୌଣସି ସୁପାରିଶ ଅପେକ୍ଷାରେ ନାହିଁ।",
    noSuggestionWaiting: "ସହାୟକ ଉତ୍ତର ପ୍ରସ୍ତୁତ କରୁଛନ୍ତି। ପୃଷ୍ଠା ସ୍ୱୟଂଚାଳିତ ଭାବେ ବଦଳିବ।",
    noSuggestionNotJoined: "ଏପର୍ଯ୍ୟନ୍ତ କେହି ଯୋଗ ଦେଇନାହାନ୍ତି। ପୃଷ୍ଠା କୌଣସି କଳ୍ପିତ ନାମ ଦେଖାଉନାହିଁ।",
    helpingWith: "ଆପଣ ଏଥିରେ ସାହାଯ୍ୟ କରୁଛନ୍ତି", helperLead: "ସୁପାରିଶ ଉତ୍ତର ଲେଖନ୍ତୁ କିମ୍ବା ବଦଳାନ୍ତୁ। ମାଲିକ ନିଷ୍ପତ୍ତି ନେବେ।",
    suggestionInput: "ସୁପାରିଶ ଉତ୍ତର", sendSuggestion: "ସୁପାରିଶ ପଠାନ୍ତୁ", finalReview: "ବର୍ତ୍ତମାନ ଉତ୍ତର ସମୀକ୍ଷା କରନ୍ତୁ",
    finalReviewLead: "ଏଗୁଡ଼ିକ ନମୁନା ଫର୍ମରେ ସଞ୍ଚୟ ହୋଇଥିବା ଉତ୍ତର। ଶେଷ କାମ କେବଳ ଆପଣ କରିପାରିବେ।",
    finishSession: "ଅଭ୍ୟାସ ସେସନ୍ ସମାପ୍ତ କରନ୍ତୁ", finalActionLead: "TrustMode ପ୍ରକୃତ ଦାଖଲ, ବୁକିଂ କିମ୍ବା ପେମେଣ୍ଟ ବଟନ୍ ଦବାଏ ନାହିଁ।",
    completedTitle: "ଅଭ୍ୟାସ ସେସନ୍ ସମାପ୍ତ", completedLead: "ସହାୟକଙ୍କ ପ୍ରବେଶ ସମାପ୍ତ। କୌଣସି ପ୍ରକୃତ ଆବେଦନ, ପଞ୍ଜିକରଣ, ବୁକିଂ କିମ୍ବା ପେମେଣ୍ଟ ହୋଇନାହିଁ।",
    downloadSummary: "ସେସନ୍ ସାରାଂଶ ଡାଉନଲୋଡ୍ କରନ୍ତୁ", noRealSubmission: "କୌଣସି ପ୍ରକୃତ ଫର୍ମ ଦାଖଲ ହୋଇନାହିଁ।",
    helpedBy: "ସାହାଯ୍ୟ କରିଛନ୍ତି", noHelperJoined: "କୌଣସି ସହାୟକ ଯୋଗ ଦେଇନାହାନ୍ତି", fieldsCompleted: "ଉତ୍ତର ସମ୍ପୂର୍ଣ୍ଣ",
    suggestionsWaiting: "ସୁପାରିଶ ଅପେକ୍ଷାରେ", simpleHidden: "ସରଳ ଦୃଶ୍ୟରେ ଅତିରିକ୍ତ କାର୍ଯ୍ୟ ତଥ୍ୟ ଲୁଚିଛି।",
  },
  scenarios: {
    scholarship: { title: "ସ୍କଲାରଶିପ୍ ଆବେଦନ", shortTitle: "ସ୍କଲାରଶିପ୍", description: "ପରିଚୟ ଦଲିଲ୍ ଦେଖାଇବା ବିନା ଶିକ୍ଷା ଓ ଯୋଗ୍ୟତା ତଥ୍ୟ ପ୍ରସ୍ତୁତ କରନ୍ତୁ।", steps: ["ସହାୟକଙ୍କୁ ଡାକନ୍ତୁ", "ଶିକ୍ଷା ଉତ୍ତର", "ଉତ୍ତର ସମୀକ୍ଷା", "ସେସନ୍ ସାରାଂଶ"], sectionTitle: "ଶିକ୍ଷା ତଥ୍ୟ", sectionLead: "ପ୍ରତ୍ୟେକ ଉତ୍ତର ଭଲଭାବେ ଯାଞ୍ଚ କରନ୍ତୁ। ଆପଣ ନିଜେ ଉତ୍ତର ଲେଖିପାରିବେ।", protectedField: "ଆଧାର ସଂଖ୍ୟା", finalAction: "ସ୍କଲାରଶିପ୍ ଆବେଦନ ଦାଖଲ କରନ୍ତୁ" },
    hospital: { title: "ହସ୍ପିଟାଲ୍ ପଞ୍ଜିକରଣ", shortTitle: "ହସ୍ପିଟାଲ୍ ପଞ୍ଜିକରଣ", description: "ମେଡିକାଲ୍ ରେକର୍ଡ ଓ ପରିଚୟ ତଥ୍ୟ ଗୋପନ ରଖି ଆପଏଣ୍ଟମେଣ୍ଟ ପ୍ରସ୍ତୁତ କରନ୍ତୁ।", steps: ["ସହାୟକଙ୍କୁ ଡାକନ୍ତୁ", "ଆପଏଣ୍ଟମେଣ୍ଟ ଉତ୍ତର", "ଉତ୍ତର ସମୀକ୍ଷା", "ସେସନ୍ ସାରାଂଶ"], sectionTitle: "ଆପଏଣ୍ଟମେଣ୍ଟ ତଥ୍ୟ", sectionLead: "ବିଭାଗ, ଭିଜିଟ୍ ପ୍ରକାର ଓ ଭାଷା ସହାୟତା ଯାଞ୍ଚ କରନ୍ତୁ।", protectedField: "ରୋଗୀ ପରିଚୟ ସଂଖ୍ୟା", finalAction: "ହସ୍ପିଟାଲ୍ ପଞ୍ଜିକରଣ ନିଶ୍ଚିତ କରନ୍ତୁ" },
    admission: { title: "କଲେଜ୍ ଭର୍ତ୍ତି", shortTitle: "କଲେଜ୍ ଭର୍ତ୍ତି", description: "ମୂଳ ସର୍ଟିଫିକେଟ୍ ସେୟାର୍ ନକରି କୋର୍ସ ଓ ଶିକ୍ଷା ତଥ୍ୟ ପ୍ରସ୍ତୁତ କରନ୍ତୁ।", steps: ["ସହାୟକଙ୍କୁ ଡାକନ୍ତୁ", "କୋର୍ସ ଉତ୍ତର", "ଉତ୍ତର ସମୀକ୍ଷା", "ସେସନ୍ ସାରାଂଶ"], sectionTitle: "କୋର୍ସ ପସନ୍ଦ", sectionLead: "କୋର୍ସ, ବୋର୍ଡ ଓ ହୋଷ୍ଟେଲ୍ ପସନ୍ଦ ଯାଞ୍ଚ କରନ୍ତୁ।", protectedField: "ଆଧାର ସଂଖ୍ୟା", finalAction: "କଲେଜ୍ ଆବେଦନ ଦାଖଲ କରନ୍ତୁ" },
  },
};

export const messages: Record<Language, Messages> = { en, hi, or };

export function getMessages(language: Language): Messages {
  return messages[language];
}

export function getScenarioCopy(language: Language, scenarioId: ScenarioId): ScenarioCopy {
  return messages[language].scenarios[scenarioId];
}
