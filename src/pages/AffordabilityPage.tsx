import { Link } from 'react-router-dom';
import AffordabilityCalculator from '../components/AffordabilityCalculator';

// /affordability 주소에 보여줄 페이지
export default function AffordabilityPage() {
  return (
    <div>
      <Link to="/" className="text-sm text-blue-600 underline">
        &larr; All calculators
      </Link>
      <div className="mt-3">
        <AffordabilityCalculator />
      </div>
      <p className="mt-6 text-xs text-slate-500">
        Uses the common 28/36 lender guideline: housing costs up to 28% of gross monthly income, and
        total debts up to 36%. Actual lender requirements vary.
      </p>
    </div>
  );
}

