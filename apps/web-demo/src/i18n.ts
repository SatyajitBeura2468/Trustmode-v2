import type { Language } from "./state/DemoContext";

export const messages = {
  en: {
    how: "How it works", safety: "Safety", accessibility: "Accessibility", start: "Start demo",
    headline: "Digital help without surrendering control.", support: "Let someone prepare the task. You keep the account, private details, and final say.",
    tryDemo: "Try the safe demo", seeHow: "See how it works", synthetic: "A controlled demonstration using synthetic data only.",
    chooseTask: "What would you like help with?", chooseLead: "Choose a prepared fictional scenario, or describe another task for practice.",
    nothing: "Nothing has changed yet", private: "Private details stay hidden", review: "Review proposals",
    approve: "Approve and apply", request: "Request change", skip: "Skip this proposal", preview: "Privacy & consequence preview",
    pause: "Pause", resume: "Resume", stop: "Stop session", ownerOnly: "Owner-only action", submit: "Submit application",
  },
  hi: {
    how: "यह कैसे काम करता है", safety: "सुरक्षा", accessibility: "सुलभता", start: "डेमो शुरू करें",
    headline: "नियंत्रण छोड़े बिना डिजिटल सहायता।", support: "किसी को काम तैयार करने दें। खाता, निजी जानकारी और अंतिम निर्णय आपके पास रहते हैं।",
    tryDemo: "सुरक्षित डेमो आज़माएँ", seeHow: "तरीका देखें", synthetic: "केवल काल्पनिक डेटा वाला नियंत्रित प्रदर्शन।",
    chooseTask: "आप किस काम में सहायता चाहते हैं?", chooseLead: "एक काल्पनिक उदाहरण चुनें या अभ्यास के लिए अपना काम बताएँ।",
    nothing: "अभी तक कुछ नहीं बदला", private: "निजी जानकारी छिपी रहती है", review: "प्रस्तावों की समीक्षा",
    approve: "स्वीकृत करके लागू करें", request: "बदलाव माँगें", skip: "यह प्रस्ताव छोड़ें", preview: "गोपनीयता और परिणाम देखें",
    pause: "रोकें", resume: "जारी रखें", stop: "सत्र बंद करें", ownerOnly: "केवल मालिक का कार्य", submit: "आवेदन जमा करें",
  },
  or: {
    how: "ଏହା କିପରି କାମ କରେ", safety: "ସୁରକ୍ଷା", accessibility: "ସୁଗମତା", start: "ଡେମୋ ଆରମ୍ଭ କରନ୍ତୁ",
    headline: "ନିୟନ୍ତ୍ରଣ ନ ଛାଡ଼ି ଡିଜିଟାଲ୍ ସହାୟତା।", support: "କାହାକୁ କାମ ପ୍ରସ୍ତୁତ କରିବାକୁ ଦିଅନ୍ତୁ। ଖାତା, ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ଓ ଶେଷ ନିଷ୍ପତ୍ତି ଆପଣଙ୍କ ପାଖରେ ରହିବ।",
    tryDemo: "ସୁରକ୍ଷିତ ଡେମୋ ଦେଖନ୍ତୁ", seeHow: "କିପରି କାମ କରେ", synthetic: "କେବଳ କାଳ୍ପନିକ ତଥ୍ୟ ସହ ନିୟନ୍ତ୍ରିତ ପ୍ରଦର୍ଶନ।",
    chooseTask: "ଆପଣ କେଉଁ କାମରେ ସହାୟତା ଚାହୁଁଛନ୍ତି?", chooseLead: "ଏକ କାଳ୍ପନିକ ଉଦାହରଣ ବାଛନ୍ତୁ କିମ୍ବା ଅଭ୍ୟାସ ପାଇଁ କାମଟି କୁହନ୍ତୁ।",
    nothing: "ଏପର୍ଯ୍ୟନ୍ତ କିଛି ବଦଳିନାହିଁ", private: "ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ଲୁଚି ରହେ", review: "ପ୍ରସ୍ତାବ ସମୀକ୍ଷା",
    approve: "ଅନୁମୋଦନ କରି ଲାଗୁ କରନ୍ତୁ", request: "ପରିବର୍ତ୍ତନ ମାଗନ୍ତୁ", skip: "ଏହି ପ୍ରସ୍ତାବ ଛାଡ଼ନ୍ତୁ", preview: "ଗୋପନୀୟତା ଓ ପରିଣାମ ଦେଖନ୍ତୁ",
    pause: "ବିରତି", resume: "ପୁଣି ଆରମ୍ଭ", stop: "ସେସନ୍ ବନ୍ଦ କରନ୍ତୁ", ownerOnly: "କେବଳ ମାଲିକଙ୍କ କାର୍ଯ୍ୟ", submit: "ଆବେଦନ ଦାଖଲ କରନ୍ତୁ",
  },
} as const;

export function getMessages(language: Language) {
  return messages[language];
}
