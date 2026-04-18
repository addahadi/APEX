import React, { useEffect, useState } from 'react';
import PlanCard from '@/components/auth/PlanCard';
import PlanTable from '@/components/auth/PlanTable';
import { PLANS } from '@/mock/mock-data';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock fetching process
    setTimeout(() => {
      const formattedPlans = PLANS.map(p => ({
        id: p.id,
        title: p.name,
        price: p.price === 0 ? 'Free' : `$${p.price}`,
        subtitle: p.duration ? `${p.duration} days plan` : '',
        highlight: p.type === 'COMPANY',
        features: Array.isArray(p.features) ? p.features.map(f => ({
          text: `${f.key} - ${f.val}`,
          icon: 'check'
        })) : [],
        buttonText: p.type === 'COMPANY' ? 'Select Company' : 'Select Normal',
      }));
      setPlans(formattedPlans);
      setLoading(false);
    }, 500);
  }, []);

  const handleSelectPlan = async (planId) => {
    alert("Subscription successful!");
    navigate("/dashboard");
  };

  const tableData = [
    { feature: 'Project Creation', normal: 'Up to 3 projects', company: 'Unlimited' },
    { feature: 'Main Modules Access', normal: 'check', company: 'check' },
    { feature: 'AI Usage', normal: '20 requests/day', company: 'bolt', highlight: true },
    { feature: 'PDF Export', normal: 'check', company: 'check' },
    { feature: 'External Services', normal: 'remove', company: 'check' },
  ];

  return (
    <div className="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 py-5 sm:px-10 lg:px-40">
          <div className="layout-content-container flex w-full max-w-[1200px] flex-1 flex-col">
            <div className="mb-8 flex flex-col items-center gap-4 p-4 pt-8 text-center">
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
                Choose Your Plan to Start Building
              </h1>
              <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-2xl text-lg">
                Select the plan that best fits your construction and estimation needs.
              </p>
            </div>

            {/* Plan Cards */}
            <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 px-4 py-4 md:grid-cols-2">
              {plans.map((plan, i) => (
                <PlanCard key={i} {...plan} onClick={() => handleSelectPlan(plan.id)} />
              ))}
            </div>

            {/* Comparison Table */}
            <div className="mx-auto mb-20 mt-16 w-full max-w-4xl px-4">
              <h3 className="mb-6 text-center text-2xl font-bold leading-tight tracking-tight">
                Compare Plan Features
              </h3>
              <PlanTable data={tableData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;