"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "Booking & Reservations",
    questions: [
      {
        question: "How do I book a car?",
        answer: "You can book a car directly through our website. Simply browse our fleet, select your desired vehicle, choose your rental period (available in 12-hour increments), fill in your details, upload required documents, and confirm your booking. The maximum rental period is 72 hours (3 days).",
      },
      {
        question: "What are the rental duration options?",
        answer: "We offer flexible rental periods in 12-hour increments. You can rent a car for 12, 24, 36, 48, 60, or 72 hours. The maximum rental period is 72 hours (3 days).",
      },
    ],
  },
  {
    category: "Documents & Requirements",
    questions: [
      {
        question: "What documents do I need to rent a car?",
        answer: "You need a valid driving license, a government-issued ID proof (Aadhaar, PAN card, or passport), and a credit or debit card for payment. All documents must be valid and not expired.",
      },
      {
        question: "Do I need to upload documents online?",
        answer: "Yes, during the booking process, you'll be required to upload clear photos of your driving license and government ID. You can use the camera capture feature on our website or upload images from your device.",
      },
    ],
  },
  {
    category: "Pricing & Payments",
    questions: [
      {
        question: "What are the security deposit amounts?",
        answer: "Security deposits vary by car type: Normal cars require ₹20,000, Standard cars require ₹25,000, and Premium/Luxury cars require ₹35,000.",
      },
    ],
  },
  {
    category: "Account & Support",
    questions: [
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking on 'Login' in the header, then selecting 'Register'. You'll need to provide your email, name, and create a password. You can also book as a guest, but creating an account allows you to track your bookings easily.",
      },
      {
        question: "How can I view my booking history?",
        answer: "Once logged in, you can view all your bookings by clicking on 'Bookings' in your profile menu or by visiting the '/bookings' page. You'll see all your past and current bookings with details.",
      },
      {
        question: "How do I contact customer support?",
        answer: "You can reach us via phone at 9100664083, email at Zioncarrentals90@gmail.com, or visit our contact page.",
      },
      {
        question: "Where is your office located?",
        answer: "Our office is located at 8,5,199 Mallika arjuna colony old bowenpally, Hyderabad - 500011, Telangana, India.",
      },
    ],
  },
];

export function FAQContent() {
  return (
    <div className="space-y-8">
      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-4">
          <h2 className="text-3xl font-semibold text-primary">{category.category}</h2>
          <Accordion type="single" collapsible className="w-full">
            {category.questions.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${categoryIndex}-${index}`}
                className="border rounded-lg px-4 mb-2"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
      
      <div className="mt-12 p-6 bg-muted rounded-lg text-center">
        <p className="text-xl font-medium mb-2">Still have questions?</p>
        <p className="text-muted-foreground mb-4 text-base">
          Our support team is here to help you
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="tel:9100664083"
            className="text-primary hover:underline font-medium text-base"
          >
            📞 9100664083
          </a>
          <a
            href="mailto:Zioncarrentals90@gmail.com"
            className="text-primary hover:underline font-medium text-base"
          >
            ✉️ Zioncarrentals90@gmail.com
          </a>
          <a
            href="/contact"
            className="text-primary hover:underline font-medium text-base"
          >
            📝 Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

