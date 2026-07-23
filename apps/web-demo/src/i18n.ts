import type { Language } from "./state/DemoContext";

export const messages = {
  en: {
    how: "How it works", safety: "Safety", accessibility: "Accessibility", start: "Start TrustMode",
    headline: "Digital help without surrendering control.", support: "Let someone prepare the task. You keep the account, private details, and final say.",
    tryDemo: "Start a controlled session", seeHow: "See how it works", synthetic: "A working controlled-local product using synthetic data only.",
    chooseTask: "What would you like help with?", chooseLead: "Describe the task or choose a controlled workflow. TrustMode will create enforceable boundaries before inviting a helper.",
    nothing: "Nothing has changed yet", private: "Private details stay hidden", review: "Review proposals",
    approve: "Approve and apply", request: "Request change", skip: "Reject proposal", preview: "Privacy & consequence preview",
    pause: "Pause", resume: "Resume", stop: "Stop session", ownerOnly: "Owner-only action", submit: "Submit application",
  },
  hi: {
    how: "यह कैसे काम करता है", safety: "सुरक्षा", accessibility: "सुगम्यता", start: "TrustMode शुरू करें",
    headline: "नियंत्रण छोड़े बिना डिजिटल सहायता।", support: "किसी को काम तैयार करने दें। खाता, निजी जानकारी और अंतिम निर्णय आपके पास रहते हैं।",
    tryDemo: "नियंत्रित सत्र शुरू करें", seeHow: "तरीका देखें", synthetic: "केवल काल्पनिक डेटा के साथ काम करने वाला नियंत्रित-स्थानीय उत्पाद।",
    chooseTask: "आप किस काम में सहायता चाहते हैं?", chooseLead: "काम बताएँ या नियंत्रित कार्यप्रवाह चुनें। सहायक को बुलाने से पहले TrustMode स्पष्ट सीमाएँ बनाएगा।",
    nothing: "अभी तक कुछ नहीं बदला", private: "निजी जानकारी छिपी रहती है", review: "प्रस्तावों की समीक्षा",
    approve: "स्वीकृत कर लागू करें", request: "बदलाव माँगें", skip: "प्रस्ताव अस्वीकार करें", preview: "गोपनीयता और परिणाम देखें",
    pause: "रोकें", resume: "जारी रखें", stop: "सत्र बंद करें", ownerOnly: "केवल मालिक का कार्य", submit: "आवेदन जमा करें",
  },
  or: {
    how: "ଏହା କିପରି କାମ କରେ", safety: "ସୁରକ୍ଷା", accessibility: "ସୁଗମତା", start: "TrustMode ଆରମ୍ଭ କରନ୍ତୁ",
    headline: "ନିୟନ୍ତ୍ରଣ ନ ହରାଇ ଡିଜିଟାଲ ସହାୟତା।", support: "କାହାକୁ କାମ ପ୍ରସ୍ତୁତ କରିବାକୁ ଦିଅନ୍ତୁ। ଖାତା, ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ଓ ଶେଷ ନିଷ୍ପତ୍ତି ଆପଣଙ୍କ ପାଖରେ ରହିବ।",
    tryDemo: "ନିୟନ୍ତ୍ରିତ ସେସନ୍ ଆରମ୍ଭ କରନ୍ତୁ", seeHow: "କିପରି କାମ କରେ ଦେଖନ୍ତୁ", synthetic: "କେବଳ କାଳ୍ପନିକ ତଥ୍ୟ ସହ କାମ କରୁଥିବା ନିୟନ୍ତ୍ରିତ-ସ୍ଥାନୀୟ ଉତ୍ପାଦ।",
    chooseTask: "ଆପଣ କେଉଁ କାମରେ ସହାୟତା ଚାହୁଁଛନ୍ତି?", chooseLead: "କାମଟି କୁହନ୍ତୁ କିମ୍ବା ଏକ ନିୟନ୍ତ୍ରିତ କାର୍ଯ୍ୟପ୍ରବାହ ବାଛନ୍ତୁ। ସହାୟକଙ୍କୁ ଡାକିବା ପୂର୍ବରୁ TrustMode ସ୍ପଷ୍ଟ ସୀମା ତିଆରି କରିବ।",
    nothing: "ଏପର୍ଯ୍ୟନ୍ତ କିଛି ବଦଳିନାହିଁ", private: "ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ଲୁଚି ରହେ", review: "ପ୍ରସ୍ତାବ ସମୀକ୍ଷା",
    approve: "ଅନୁମୋଦନ କରି ଲାଗୁ କରନ୍ତୁ", request: "ପରିବର୍ତ୍ତନ ମାଗନ୍ତୁ", skip: "ପ୍ରସ୍ତାବ ଅସ୍ୱୀକାର କରନ୍ତୁ", preview: "ଗୋପନୀୟତା ଓ ପରିଣାମ ଦେଖନ୍ତୁ",
    pause: "ବିରତି", resume: "ପୁଣି ଆରମ୍ଭ", stop: "ସେସନ୍ ବନ୍ଦ କରନ୍ତୁ", ownerOnly: "କେବଳ ମାଲିକଙ୍କ କାର୍ଯ୍ୟ", submit: "ଆବେଦନ ଦାଖଲ କରନ୍ତୁ",
  },
} as const;

export function getMessages(language: Language) {
  return messages[language];
}
