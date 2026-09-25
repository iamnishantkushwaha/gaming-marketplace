import { VerificationFlow } from "@/components/shared/VerificationFlow";

export default function SellerVerificationPage() {
  return (
    <div>
      <h1 className="mb-6 gt-page-title text-center">Verification</h1>
      <VerificationFlow frame="seller" />
    </div>
  );
}
