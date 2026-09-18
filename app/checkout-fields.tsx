export function CheckoutFields() {
  return <>
    <p className="helper checkout-demo-note">Use sample details for this practice order. Nothing will be shipped and no email will be sent.</p>
    <fieldset className="checkout-section">
      <legend><span>01</span> Contact details</legend>
      <label>Full name<input name="fullName" autoComplete="section-demo shipping name" required maxLength={120} placeholder="Alex Taylor" /></label>
      <label>Email address<input name="email" type="email" autoComplete="section-demo shipping email" required maxLength={254} placeholder="alex@example.com" /></label>
      <label>Phone number <span className="optional">(optional)</span><input name="phone" type="tel" autoComplete="section-demo shipping tel" maxLength={40} placeholder="For delivery questions" /></label>
    </fieldset>
    <fieldset className="checkout-section">
      <legend><span>02</span> Shipping address</legend>
      <label>Street address<input name="addressLine1" autoComplete="section-demo shipping address-line1" required maxLength={200} placeholder="123 Example Street" /></label>
      <label>Apartment, suite, etc. <span className="optional">(optional)</span><input name="addressLine2" autoComplete="section-demo shipping address-line2" maxLength={200} placeholder="Apt 4B" /></label>
      <div className="two-col">
        <label>City<input name="city" autoComplete="section-demo shipping address-level2" required maxLength={120} /></label>
        <label>State / province <span className="optional">(optional)</span><input name="region" autoComplete="section-demo shipping address-level1" maxLength={120} /></label>
      </div>
      <div className="two-col">
        <label>ZIP / postal code <span className="optional">(if applicable)</span><input name="postalCode" autoComplete="section-demo shipping postal-code" maxLength={32} /></label>
        <label>Country<input name="country" autoComplete="section-demo shipping country-name" required maxLength={80} placeholder="United States" /></label>
      </div>
      <p className="helper">Your contact and shipping details are saved with this practice order.</p>
    </fieldset>
  </>;
}
