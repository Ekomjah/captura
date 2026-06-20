import { useEffect } from "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": {
        "pricing-table-id": string;
        "publishable-key": string;
        children?: never;
      };
    }
  }
}
export function PricingPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <stripe-pricing-table
      pricing-table-id="prctbl_1TjKOUClT4GjTBlb2JdpVTli"
      publishable-key="pk_test_51TiobVClT4GjTBlbeQwXiyFQhac8FaPcxvF3bFAhzF89r8tBmBrNrg2R9NsmUsOXdlmJQFXeIFxX1lyFVObDCwqe00y62rMxYs"
    />
  );
}

// <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
// <stripe-pricing-table pricing-table-id="prctbl_1TjKOUClT4GjTBlb2JdpVTli"
// publishable-key="pk_test_51TiobVClT4GjTBlbeQwXiyFQhac8FaPcxvF3bFAhzF89r8tBmBrNrg2R9NsmUsOXdlmJQFXeIFxX1lyFVObDCwqe00y62rMxYs">
// </stripe-pricing-table>
