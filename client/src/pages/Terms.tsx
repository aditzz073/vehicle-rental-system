import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Terms: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="bg-primary text-white py-4">
        <Container>
          <h1 className="mb-0">Terms of Service</h1>
          <p className="lead mb-0">Last updated: May 1, 2025</p>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row>
          <Col lg={3} className="mb-4">
            <div className="sticky-top" style={{ top: '20px' }}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Contents</h5>
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <a href="#agreement" className="nav-link px-0">1. Agreement</a>
                    </li>
                    <li className="nav-item">
                      <a href="#eligibility" className="nav-link px-0">2. Eligibility</a>
                    </li>
                    <li className="nav-item">
                      <a href="#account" className="nav-link px-0">3. Account</a>
                    </li>
                    <li className="nav-item">
                      <a href="#rental" className="nav-link px-0">4. Vehicle Rental</a>
                    </li>
                    <li className="nav-item">
                      <a href="#payments" className="nav-link px-0">5. Payments</a>
                    </li>
                    <li className="nav-item">
                      <a href="#cancellation" className="nav-link px-0">6. Cancellation</a>
                    </li>
                    <li className="nav-item">
                      <a href="#insurance" className="nav-link px-0">7. Insurance</a>
                    </li>
                    <li className="nav-item">
                      <a href="#liability" className="nav-link px-0">8. Liability</a>
                    </li>
                    <li className="nav-item">
                      <a href="#privacy" className="nav-link px-0">9. Privacy</a>
                    </li>
                    <li className="nav-item">
                      <a href="#termination" className="nav-link px-0">10. Termination</a>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </div>
          </Col>
          
          <Col lg={9}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="terms-content">
                  <section id="agreement" className="mb-5">
                    <h3 className="mb-3">1. Agreement</h3>
                    <p>
                      Welcome to AutoHive. These Terms of Service ("Terms") govern your use of the AutoHive website, 
                      mobile application, and services (collectively, the "Service").
                    </p>
                    <p>
                      By accessing or using the Service, you agree to be bound by these Terms. If you disagree with 
                      any part of the Terms, you may not access the Service.
                    </p>
                    <p>
                      We may modify these Terms at any time. We will notify you of any changes by posting the new Terms 
                      on this page and updating the "last updated" date at the top. Your continued use of the Service 
                      after any such changes constitutes your acceptance of the new Terms.
                    </p>
                  </section>
                  
                  <section id="eligibility" className="mb-5">
                    <h3 className="mb-3">2. Eligibility</h3>
                    <p>
                      To use our Service, you must be at least 21 years of age and possess a valid driver's license. 
                      Depending on the vehicle type, additional age restrictions may apply.
                    </p>
                    <p>
                      You must have a clean driving record with no major violations within the past 3 years, including 
                      but not limited to:
                    </p>
                    <ul>
                      <li>Driving under the influence of alcohol or drugs</li>
                      <li>Reckless driving</li>
                      <li>Driving with a suspended or revoked license</li>
                      <li>Leaving the scene of an accident</li>
                    </ul>
                    <p>
                      AutoHive reserves the right to verify your driving record and decline service based on our 
                      eligibility criteria.
                    </p>
                  </section>
                  
                  <section id="account" className="mb-5">
                    <h3 className="mb-3">3. Account</h3>
                    <p>
                      When you create an account with us, you must provide accurate, complete, and current information. 
                      Failure to do so constitutes a breach of the Terms, which may result in immediate termination of 
                      your account.
                    </p>
                    <p>
                      You are responsible for safeguarding the password that you use to access the Service and for any 
                      activities or actions under your password. You agree not to disclose your password to any third party.
                    </p>
                    <p>
                      You must notify us immediately upon becoming aware of any breach of security or unauthorized use 
                      of your account.
                    </p>
                  </section>
                  
                  <section id="rental" className="mb-5">
                    <h3 className="mb-3">4. Vehicle Rental</h3>
                    <p>
                      When you rent a vehicle through our Service, you agree to:
                    </p>
                    <ul>
                      <li>Use the vehicle only for lawful purposes and in accordance with these Terms</li>
                      <li>Not modify the vehicle or remove any parts</li>
                      <li>Return the vehicle in the same condition as when received, excluding normal wear and tear</li>
                      <li>Not smoke in the vehicle</li>
                      <li>Not use the vehicle for commercial purposes without prior written consent</li>
                      <li>Not use the vehicle for racing or off-road activities</li>
                      <li>Not drive the vehicle outside the agreed-upon geographic limits</li>
                      <li>Comply with all traffic laws and regulations</li>
                    </ul>
                    <p>
                      AutoHive reserves the right to track the location of our vehicles using GPS technology for 
                      security purposes.
                    </p>
                  </section>
                  
                  <section id="payments" className="mb-5">
                    <h3 className="mb-3">5. Payments</h3>
                    <p>
                      The rental rates, fees, and deposit requirements are specified at the time of booking. By proceeding 
                      with a reservation, you agree to pay all charges, including:
                    </p>
                    <ul>
                      <li>Base rental rate</li>
                      <li>Insurance fees (if selected)</li>
                      <li>Applicable taxes</li>
                      <li>Refueling charges (if vehicle is not returned with the same fuel level)</li>
                      <li>Cleaning fees (if the vehicle requires extraordinary cleaning)</li>
                      <li>Traffic or parking violation fees incurred during your rental period</li>
                      <li>Damage repair costs not covered by insurance</li>
                      <li>Late return fees</li>
                    </ul>
                    <p>
                      A hold will be placed on your payment method for the security deposit amount, which will be released 
                      after the vehicle is returned in satisfactory condition.
                    </p>
                  </section>
                  
                  <section id="cancellation" className="mb-5">
                    <h3 className="mb-3">6. Cancellation</h3>
                    <p>
                      Our cancellation policy is as follows:
                    </p>
                    <ul>
                      <li>Cancellations made more than 72 hours before pickup: Full refund</li>
                      <li>Cancellations made between 24-72 hours before pickup: 50% refund</li>
                      <li>Cancellations made less than 24 hours before pickup: No refund</li>
                    </ul>
                    <p>
                      AutoHive reserves the right to cancel a reservation at any time if the vehicle becomes unavailable due to 
                      unforeseen circumstances. In such cases, we will provide a full refund or offer an alternative vehicle.
                    </p>
                  </section>
                  
                  <section id="insurance" className="mb-5">
                    <h3 className="mb-3">7. Insurance</h3>
                    <p>
                      Basic insurance coverage is included in all rentals, which includes:
                    </p>
                    <ul>
                      <li>Liability coverage up to state minimum requirements</li>
                      <li>Collision damage waiver with a deductible</li>
                    </ul>
                    <p>
                      Additional coverage options are available for purchase during the booking process. It is your responsibility 
                      to review and understand the coverage details before accepting the rental agreement.
                    </p>
                    <p>
                      Insurance coverage may be voided if the damage occurs while the vehicle is being used in violation 
                      of these Terms.
                    </p>
                  </section>
                  
                  <section id="liability" className="mb-5">
                    <h3 className="mb-3">8. Liability</h3>
                    <p>
                      To the maximum extent permitted by applicable law, AutoHive and its officers, directors, employees, and 
                      agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                      including but not limited to, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                    <p>
                      AutoHive shall not be liable for any damage, injury, or loss caused by or to any vehicle renter or 
                      third party. You agree to indemnify and hold harmless AutoHive from any claims, demands, or damages 
                      arising out of your use of the Service or violation of these Terms.
                    </p>
                  </section>
                  
                  <section id="privacy" className="mb-5">
                    <h3 className="mb-3">9. Privacy</h3>
                    <p>
                      Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms, explains 
                      how we collect, use, and disclose information about you. By using our Service, you consent to the 
                      collection, use, and disclosure of information as described in our Privacy Policy.
                    </p>
                  </section>
                  
                  <section id="termination" className="mb-5">
                    <h3 className="mb-3">10. Termination</h3>
                    <p>
                      We may terminate or suspend your account immediately, without prior notice or liability, for any 
                      reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p>
                      Upon termination, your right to use the Service will immediately cease. If you wish to terminate 
                      your account, you may simply discontinue using the Service or contact us to request account deletion.
                    </p>
                  </section>
                </div>
                
                <div className="mt-5 pt-3 border-top">
                  <p className="text-muted">
                    If you have any questions about these Terms, please contact us at{' '}
                    <a href="mailto:legal@autohive.com">legal@autohive.com</a>.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Terms;
