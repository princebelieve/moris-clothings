import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const answers = [
  ["Can I request a bespoke piece?", "Yes. Use the contact form to tell us about the garment, occasion and fit you have in mind."],
  ["How do I choose a size?", "Available sizes are shown on each product. Contact the tailoring team if you need help with fit or measurements."],
  ["Can I shop without creating an account?", "Yes. Guest checkout is available; an account is optional."],
  ["When will my order arrive?", "Delivery options and costs are shown during checkout. We will share tracking details when your order is dispatched."],
  ["How can I ask about an order?", "Contact Moris with your order reference and the team will help you."],
];

export default function Faq() {
  return <><Navbar /><main className="shop-shell"><p className="eyebrow">HERE TO HELP</p><h1>Frequently asked questions</h1><div className="faq-list">{answers.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></main><Footer /></>;
}
