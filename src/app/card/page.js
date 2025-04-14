import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

// The ServiceCard component
const ServiceCard = ({ title, description, features, price, popular = false, ctaText = "Get Started" }) => {
  return (
    <div className={`rounded-lg overflow-hidden border ${popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'} transition-all duration-300 hover:shadow-xl`}>
      {popular && (
        <div className="bg-blue-500 text-white py-1 px-4 text-center text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {price && (
          <div className="mb-6">
            <span className="text-3xl font-bold">${price}</span>
            {price !== 'Custom' && <span className="text-gray-500">/month</span>}
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Features include:</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex flex-row items-start w-full">
                <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-600 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <button className={`w-full py-2 px-4 rounded flex items-center justify-center transition-colors ${popular ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
          {ctaText}
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// Sample usage in a services grid component
export default function ServicesGrid() {
  const services = [
    {
      title: "Basic Plan",
      description: "Perfect for small businesses just getting started.",
      price: "49",
      features: [
        "Up to 5 users",
        "10GB storage",
        "Basic analytics",
        "24/7 support"
      ],
      popular: false
    },
    {
      title: "Professional",
      description: "Ideal for growing teams with more advanced needs.",
      price: "99",
      features: [
        "Up to 20 users",
        "50GB storage",
        "Advanced analytics",
        "Priority support",
        "Custom integrations"
      ],
      popular: true
    },
    {
      title: "Enterprise",
      description: "For large organizations with complex requirements.",
      price: "Custom",
      features: [
        "Unlimited users",
        "Unlimited storage",
        "Custom reporting",
        "Dedicated account manager",
        "SLA guarantees",
        "On-premise options"
      ],
      popular: false,
      ctaText: "Contact Sales"
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </div>
  );
}