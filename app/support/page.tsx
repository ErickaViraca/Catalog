import Link from "next/link";

const FAQS = [
  {
    question: "¿Cómo hago un pedido?",
    answer:
      "Navega el catálogo, elige el producto que buscas y contáctanos por WhatsApp o email para coordinar la compra y el pago.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos transferencia bancaria, QR y pago en efectivo en tienda. Coordina el método que prefieras al momento de tu pedido.",
  },
  {
    question: "¿Los productos tienen garantía?",
    answer:
      "Sí, todos nuestros productos son originales y cuentan con garantía del fabricante. El tiempo de garantía varía según el producto.",
  },
  {
    question: "¿Puedo devolver o cambiar un producto?",
    answer:
      "Sí, aceptamos cambios dentro de los primeros 7 días si el producto presenta algún defecto de fábrica y conserva su empaque original.",
  },
  {
    question: "¿Los productos son originales?",
    answer:
      "Sí, trabajamos únicamente con productos originales y sellados, con todos sus accesorios y garantía correspondiente.",
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Soporte</h1>
        <p className="text-gray-600 text-lg">
          Encuentra respuestas a las preguntas más frecuentes.
        </p>
      </div>

      <div className="space-y-4 mb-12">
        {FAQS.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">
          ¿No encontraste lo que buscabas?
        </p>
        <Link href="/contact" className="text-primary font-semibold hover:underline">
          Contáctanos directamente →
        </Link>
      </div>
    </div>
  );
}
