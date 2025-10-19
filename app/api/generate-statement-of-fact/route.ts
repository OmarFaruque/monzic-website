
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getPolicyByNumber } from "@/lib/policy-server";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const policyNumber = searchParams.get("number");

  if (!policyNumber) {
    return new NextResponse("Policy number is required", { status: 400 });
  }

  try {
    const policy = await getPolicyByNumber(policyNumber);

    if (!policy) {
      return new NextResponse("Policy not found", { status: 404 });
    }

    const quoteData = JSON.parse(policy.quoteData || '{}');

    const quote = {
      ...policy,
      policy_number: policy.policyNumber,
      start_date: policy.startDate,
      start_time: policy.startTime,
      end_date: policy.endDate,
      end_time: policy.endTime,
      first_name: policy.firstName,
      middle_name: "", // Not available
      last_name: policy.lastName,
      title: policy.title || quoteData.customerData?.title || "",
      address: policy.address,
      postcode: policy.postcode,
      contact_number: policy.phone,
      email: policy.email || quoteData.customerData?.email,
      date_of_birth: policy.dateOfBirth,
      licence_type: quoteData.customerData?.licenceType || "N/A",
      occupation: quoteData.customerData?.occupation || "N/A",
      vehicle_make: policy.vehicleMake,
      vehicle_model: policy.vehicleModel,
      reg_number: policy.regNumber,
      vehicle_value: quoteData.customerData?.vehicleValue || "N/A",
    };

    // Read image and convert to base64
    const imagePath = path.resolve("./public/placeholder-logo.png"); // Using a placeholder
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const headerTemplate = `
      <div style="width: 100%; text-align: right; padding: 0 40px; margin-top: -20px;">
        <img src="data:image/png;base64,${imageBase64}" style="height: 40px; width: auto;">
      </div>
    `;

    const footerTemplate = `
      <div style="width: 100%; font-size: 6px; text-align: center; color: #333; padding-bottom: 10px;">
        Mulsanne Insurance Company Limited, PO Box 1338, 1st Floor, Grand Ocean Plaza, Ocean Village, Gibraltar
      </div>
    `;

    const html = `
    <style>
        body { font-family: Helvetica, sans-serif; font-size: 10pt; color: #333; }
        .bd{ font-weight: bold; }
        .ud{ font-weight: bold; text-decoration: underline; }
        .it{ font-style: italic; }
        .tb0{ width:100%; border: 1px solid #222; border-collapse: collapse; padding:1px 6px; }
        .tb0 td { padding: 4px 8px; }
        .tb0 .td1{ width: 40%; font-size: 8.5pt; }
        .tb0 .td2{ width: 60%; font-size: 8.5pt; }
        .tb1{ width:100%; padding:1px 0px; }
        .tb1 .td1{ width: 5%; font-weight: bold; font-size: 10pt; text-align:center; }
        .tb1 .td2{ width: 95%; font-weight: bold; font-size: 10pt; }
        .tb2{ width:100%; padding:1px 0px; }
        .tb2 .td1{ width: 5%; font-size: 10pt; }
        .tb2 .td2{ width: 2.7%; font-size: 10pt; }
        .tb2 .td3{ width: 92.3%; font-size: 10pt; }
        .tb3{ width:100%; padding:0px; }
        .tb3 td { font-size: 8.3pt; padding: 3px 0; }
        .page-break { page-break-after: always; }
    </style>
    <div style="padding-bottom:6px; font-weight:bold; font-size:12pt;">STATEMENT OF FACT - Short Term Insurance</div>
    <table class="tb0">
        <tr><td class="td1 bd it">Your Agent</td><td class="td2"></td></tr>
        <tr><td class="td1">Agent</td><td class="td2">TEMPNOW Limited</td></tr>
        <tr><td class="td1" style="padding: 2px;"></td><td class="td2"></td></tr>
        <tr><td class="td1 bd it">Your Details - Name Address</td><td class="td2"></td></tr>
        <tr><td class="td1">Surname</td><td class="td2">${quote.last_name}</td></tr>
        <tr><td class="td1">Forename(s)</td><td class="td2">${quote.first_name} ${quote.middle_name}</td></tr>
        <tr><td class="td1">Title</td><td class="td2">${quote.title}</td></tr>
        <tr><td class="td1">Address</td><td class="td2">${quote.address}, ${quote.postcode}</td></tr>
        <tr><td class="td1">Telephone number</td><td class="td2">${quote.contact_number}</td></tr>
        <tr><td class="td1">Email address</td><td class="td2">${quote.email}</td></tr>
        <tr><td class="td1" style="padding: 2px;"></td><td class="td2"></td></tr>
        <tr><td class="td1 bd it">Your Policy Cover</td><td class="td2"></td></tr>
        <tr><td class="td1">Effective Date</td><td class="td2">${new Date(quote.start_date).toLocaleString('en-GB')}</td></tr>
        <tr><td class="td1">Expire Date</td><td class="td2">${new Date(quote.end_date).toLocaleString('en-GB')}</td></tr>
        <tr><td class="td1">Policy Cover</td><td class="td2">COMPREHENSIVE</td></tr>
        <tr><td class="td1">Number of Drivers (including you)</td><td class="td2">1</td></tr>
        <tr><td class="td1">Class of Use</td><td class="td2">Use for social domestic and pleasure purposes and use in person by the Policyholder in connection with their business or profession EXCLUDING use for hire or reward, racing, pacemaking, speed testing, commercial travelling or use for any purpose in connection with the motor trade.</td></tr>
        <tr><td class="td1" style="padding: 2px;"></td><td class="td2"></td></tr>
        <tr><td class="td1 bd it">Driver Details (including you)</td><td class="td2"></td></tr>
        <tr><td class="td1">Full Name</td><td class="td2">${quote.first_name} ${quote.middle_name} ${quote.last_name}</td></tr>
        <tr><td class="td1">Sex</td><td class="td2">-</td></tr>
        <tr><td class="td1">Date of Birth</td><td class="td2">${new Date(quote.date_of_birth).toLocaleDateString('en-GB')}</td></tr>
        <tr><td class="td1">Licence Type</td><td class="td2">${quote.licence_type}</td></tr>
        <tr><td class="td1">Occupation</td><td class="td2">${quote.occupation}</td></tr>
        <tr><td class="td1" style="padding: 2px;"></td><td class="td2"></td></tr>
        <tr><td class="td1 bd it">Vehicle Details</td><td class="td2"></td></tr>
        <tr><td class="td1">Make</td><td class="td2">${quote.vehicle_make}</td></tr>
        <tr><td class="td1">Model</td><td class="td2">${quote.vehicle_model}</td></tr>
        <tr><td class="td1">Registration number</td><td class="td2">${quote.reg_number}</td></tr>
        <tr><td class="td1">Vehicle value</td><td class="td2">£${quote.vehicle_value}</td></tr>
        <tr><td class="td1" style="padding: 2px;"></td><td class="td2"></td></tr>
        <tr><td class="td1 bd it">Accident / Claim Details</td><td class="td2"></td></tr>
        <tr><td class="td1">Driver Name</td><td class="td2">${quote.first_name} ${quote.middle_name} ${quote.last_name}</td></tr>
        <tr><td class="td1">Date of Claim/Incident</td><td class="td2">-</td></tr>
        <tr><td class="td1">Costs</td><td class="td2">-</td></tr>
        <tr><td class="td1">Fault or Non-Fault</td><td class="td2">-</td></tr>
        <tr><td colspan="2" style="width:100%; padding: 4px 0;"><hr style="border-top: 1.5px solid #222;"></td></tr>
        <tr><td class="td1">Driver Name</td><td class="td2">${quote.first_name} ${quote.middle_name} ${quote.last_name}</td></tr>
        <tr><td class="td1">Date of Claim/Incident</td><td class="td2">-</td></tr>
        <tr><td class="td1">Costs</td><td class="td2">-</td></tr>
        <tr><td class="td1">Fault or Non-Fault</td><td class="td2">-</td></tr>
        <tr><td colspan="2" style="width:100%;"><br><div style="width:100%; background-color:#000; color:#FFF; text-align:center; font-size:9.2pt; padding: 4px;">IMPORTANT - You also must read the Mulsanne Insurance Proposer Declaration & Important Notes on Pages 2 & 3</div></td></tr>
    </table>
    <div class="page-break"></div>
    <div style="font-size:15pt; font-weight:bold">Mulsanne / PROPOSER DECLARATION</div>
    <table class="tb1" style="padding-top:10px;"><tr><td class="td1">1.</td><td class="td2">I declare that I:</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">a.</td><td class="td3">Have no more than 2 motoring convictions and/or 6 penalty points in the last 3 years, and have no prosecution or police enquiry pending, other than a No Insurance conviction resulting from the current seizure of the vehicle.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">b.</td><td class="td3">Have NOT been disqualified from driving in the last 5 years.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">c.</td><td class="td3">Have no criminal convictions.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">d.</td><td class="td3">Have no more than 1 fault claim within the last 3 years (a pending or non-recoverable claim is considered a fault claims).</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">e.</td><td class="td3">Have <span class="bd ud">NOT</span> had a policy of insurance voided or cancelled by an insurance company</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">f.</td><td class="td3">Am a permanent UK resident for at least 36 month</td></tr></table>
    <table class="tb1"><tr><td class="td1">2.</td><td class="td2">I declare that the vehicle:</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">a.</td><td class="td3">Will only be used for social, domestic and pleasure purposes.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">b.</td><td class="td3">Is owned by me and I can prove legal title to the vehicle.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">c.</td><td class="td3">Will NOT be used for commuting, business use, hire or reward, racing, pace-making, speed testing, commercial travelling or use for any purpose in relation to the motor trade.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">d.</td><td class="td3">Will not be used to carry hazardous goods or be driven at a hazardous location.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">e.</td><td class="td3">Has not been modified and has no more than 8 seats in total and is right-hand drive only.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">g.</td><td class="td3">Is registered in Great Britain, Northern Ireland or the Isle of Man.</td></tr></table>
    <table class="tb2"><tr><td class="td1"></td><td class="td2">f.</td><td class="td3">Will be in the UK at the start of the policy and will not be exported from the UK during the duration of the policy.</td></tr></table>
    <table class="tb1"><tr><td class="td1">3.</td><td class="td2">I am aware that this insurance cannot be used for any vehicle not owned by me including Hire or Loan Vehicles (i.e. Vehicle Rentals, Vehicle Salvage/Recovery Agents, Credit Hire Vehicles/Companies and Accident Management Companies).</td></tr></table>
    <table class="tb1"><tr><td class="td1">4.</td><td class="td2">I agree that in the event of a claim I will provide the V5 registration document, a current MOT certificate (where one is required by law to be issued) and a copy of my driving licenc</td></tr></table>
    <div class="page-break"></div>
    <div style="font-size:12pt; font-weight:bold">IMPORTANT NOTES</div>
    <table class="tb3" style="padding-top:5px;"><tr><td class="td1"><span class="bd ud">WARNING:</span> No cover attaches until a Cover Note or Certificate of Motor Insurance has been issued by the Insurer or by their authorised agent on their behalf. If is an offence to make a false statement or to withhold any material information to obtain the issue of a Certificate of Motor Insurance. If you are in doubt about facts considered material you should disclose them. The Insurer reserves the right to decline any proposal or apply special terms. The Insurer reserves the right to establish the milometer (odometer) reading.</td></tr></table>
    <table class="tb3"><tr><td class="td1"><span>Claims and Underwriting Exchange:</span> Insurers pass information to the Claims and Underwriting Register, run by Insurance Database Mulsannes (IDS Ltd). The aim is to help us check information provided and also to prevent fraudulent claims. When we deal with your request for insurance, we may search the register. When you tell us about an incident which may or may not give rise to a claim, we will pass information relating to it to the register. You should show this notice to anyone who has an interest in vehicle insured under the policy.</td></tr></table>
    <table class="tb3"><tr><td class="td1">Motor Insurance Anti-Fraud and Theft Register: Insurers pass information to the Motor Insurance Anti-Fraud and Theft Register, run by the Association of British Insurers (ABI). The aim is to help us check information provided and also to prevent fraudulent claims. When we deal with your request for insurance, we may search the register. Under the conditions of your policy, you must tell us about any incident (such as accident or theft) which may or may not give rise to a claim. When you tell us about an incident, we will pass information relating to it to the register.</td></tr></table>
    <table class="tb3"><tr><td class="td1">Motor Insurance Database - Continuous Insurance Enforcement Information relating to your policy will be added to the Motor Insurance Database ('MID') managed by the Motor Insurance Bureau ('MIB'). MID and the data stored on it may be used by certain statutory and/or authorised bodies including the Police, the DVLA, the DVLANI, the Insurance Fraud Bureau and other bodies permitted by law for purposes not limited to but including:</td></tr></table>
    <table class="tb3"><tr><td class="td1">I. Electronic (Licensing)</td></tr></table>
    <table class="tb3"><tr><td class="td1">II. Continuous Insurance Enforcement</td></tr></table>
    <table class="tb3"><tr><td class="td1">III. Law enforcement (prevention, detection, apprehension and or prosecution of offenders)</td></tr></table>
    <table class="tb3"><tr><td class="td1">IV. The provision of government Mulsannes and or other Mulsannes aimed at reducing the level and incidence of uninsured driving.</td></tr></table>
    <table class="tb3"><tr><td class="td1">If you are involved in a road traffic accident (either in the UK, EEA or certain other territories), insurers and or the MIB may search the MID to obtain relevant information. Persons (including his or her appointed representatives) pursuing a claim in respect of a road traffic accident (including citizens of other countries) may also obtain information which is held on the MID. It is vital that the MID holds your correct registration number. If it is incorrectly shown on MID you are at risk of having your vehicle seized by the Police. You can check that your correct registration number details are shown on the MID at www.askmid.com. You should show this notice to anyone insured to drive the vehicle covered under the Policy.</td></tr></table>
    <table class="tb3" style="padding-top:7px;"><tr><td class="td1"><span class="bd">DECLARATION:</span></td></tr></table>
    <table class="tb3"><tr><td class="td1">By agreeing to the delaration during the quotation process, I declare that to the best of my knowledge and belief all statements and answers in the proposal are true and correct. I understand that it is my duty to take reasonable care not to make a misrepresentation of information which will influence and/or assessment of the proposal and that due to the short term nature of the policy, changes and additions cannot be made once the policy has been taken out.</td></tr></table>
    <table class="tb3"><tr><td class="td1">I agree that this Proposal and Declaration shall form the basis of the contract between me and the Insurer and that if any answer has been written by any other person, such person shall be deemed to be my agent for that purpose. A copy of this completed Statement of Fact will be provided as an attachment in the Confirmation Email sent following the purchase of the policy, or by post if requested during the quotation process. You should keep a record (including copies of letters) of all information supplied to us for the purpose of entering into this contract. A specimen policy is available on request.</td></tr></table>
    <table class="tb3" style="padding-top:7px;"><tr><td class="td1"><span class="bd">IN THE EVENT OF A COMPLAINT</span></td></tr></table>
    <table class="tb3"><tr><td class="td1">Mulsanne Insurance Company Ltd aim to provide a standard of service that will leave no cause for complaint. However if <span class="bd">you</span> are dissatisfied with the service <span class="bd">we</span> have provided please write to The Complaints Department, c/o The A&A Group Ltd or Hyperformance Ltd, Garrick House, 161 High Street, Hampton Hill, Middlesex, TW12 1NL quoting <span class="bd">your</span> policy number or claim number and give <span class="bd">us</span> full details of <span class="bd">your</span> complaint. The A&A Group and Hyperformance Ltd are authorised to issue a final response to your complaint but where appropriate the final response may be issued by <span class="bd">your</span> insurer, Mulsanne Insurance Company Limited.</td></tr></table>
    <table class="tb3"><tr><td class="td1">Should <span class="bd">you</span> remain dissatisfied having received a final response, <span class="bd">you</span> may be able to take <span class="bd">your</span> complaint to the Financial Ombudsman Service (FOS) if it is appropriate in the circumstances of <span class="bd">your</span> complaint. Their address is The Financial Ombudsman Service, South Quay Plaza, 183 Marsh Wall, London E14 9SR.</td></tr></table>
    <table class="tb3"><tr><td class="td1"><span>INSURER INFORMATION</span></td></tr></table>
    <table class="tb3"><tr><td class="td1">Mulsanne Insurance Company Limited is licensed by the Chief Executive of the Gibraltar Financial Services Commission under the Insurance Companies Act to carry on insurance business. Address: Mulsanne Insurance Company Limited, PO Box 1338, First Floor, Grand Ocean Plaza, Ocean Village, Gibraltar.</td></tr></table>
    <table class="tb3"><tr><td class="td1">The following companies act as administrators on behalf of Mulsanne Insurance Company Limited:</td></tr></table>
    <table class="tb3"><tr><td class="td1">The A&A Group. Registered in England and Wales: Company No: 03578103. Registered Address: Garrick House, 161 High Street, Hampton Hill, Middlesex, TW12 1NL. Authorised and regulated by the Financial Conduct Authority. FCA Register Number: 309611.</td></tr></table>
    <table class="tb3"><tr><td class="td1">Hyperformance Limited. Registered in England and Wales: Company No: 03758951. Registered Address: Garrick House, 161 High Street, Hampton Hill, Middlesex, TW12 1NL. Authorised and regulated by the Financial Conduct Authority. FCA Register Number: 307711.</td></tr></table>
    <table style="width:100%; margin-top: 10px;"><tr><td>
      <div style="background-color:#000; color:#FFF; font-size:10pt; text-align:center; font-weight:bold; padding: 5px;">IMPORTANT<br>There is no need to sign this document, as by agreeing to the declaration during the quotation process you have confirmed that you have read and agree to the Mulsanne / Proposer's Declaration</div>
    </td></tr></table>
    `;

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
      displayHeaderFooter: true,
      margin: {
        top: "80px",
        bottom: "50px",
        right: "40px",
        left: "40px",
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}
