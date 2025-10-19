
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getPolicyByNumber } from "@/lib/policy-server";

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
        middle_name: '',
        last_name: policy.lastName,
        address: policy.address,
        postcode: policy.postcode,
        cover_reason: quoteData.customerData?.coverReason || 'New Business',
        update_price: policy.update_price ?? policy.cpw,
        reg_number: policy.regNumber,
        vehicle_value: quoteData.customerData?.vehicleValue,
        vehicle_name: policy.vehicleMake,
        vehicle_model: policy.vehicleModel,
    };

    const parts = quote.address?.split(", ") || ["", ""];
    const lastPart = parts.pop() || "";
    const firstPart = parts.join(", ");

    const html = `
      <style>
        body { font-family: Helvetica, sans-serif; color: #333; font-size: 9.5px; }
        .normal{ font-size: 8px; font-weight: normal; color: #333;}
        .it{ font-style: italic; }
        .bd{ font-weight: bold; color:#333; }
        .ud{ text-decoration: underline; }
        .tb0{ width:100%; border-collapse: collapse; padding:5px 6px; border-left: 0.57px solid #222; border-top: 0.57px solid #222; }
        .tb0 td { padding: 3px; }
        .tb0 .td1{ width: 28%; border-right: 0.57px solid #222; border-bottom: 0.57px solid #222; }
        .tb0 .td2{ width: 14%; border-right: 0.57px solid #222; border-bottom: 0.57px solid #222; }
        .tb0 .td3{ width: 14%; border-right: 0.57px solid #222; border-bottom: 0.57px solid #222; }
        .tb0 .td4{ width: 14%; border-right: 0.57px solid #222; border-bottom: 0.57px solid #222; }
        .tb0 .td5{ width: 30%; border-right: 0.57px solid #222; border-bottom: 0.57px solid #222; }
        .tb0 .hd{ text-align: center; font-weight:bold; font-size: 8px; }
        .tb1{ width:100%; padding:0px; font-size: 8pt; }
        .tb1 td{ font-size: 8pt; }
        .tb1 .tdl{ font-size: 8.2pt; }
      </style>
      <table class="tb0">
        <tr>
            <td style="width:56%" class="td1 hd" colspan="3">SHORT TERM INSURANCE - MULSANNE</td>
            <td style="width:44%" class="td4 hd" colspan="2">NEW BUSINESS SCHEDULE</td>
        </tr>
        <tr>
            <td class="td1"><table class="tb1"><tr><td class="bd">Policy Number:</td></tr><tr><td>${quote.policy_number}</td></tr></table></td>
            <td class="td2"><table class="tb1"><tr><td class="bd">Date Issued:</td></tr><tr><td>${new Date(quote.start_date).toLocaleDateString('en-GB')}</td></tr></table></td>
            <td class="td3" style="width:58%" colspan="3"><table class="tb1"><tr><td class="bd">Agent:</td></tr><tr><td>TEMPNOW Limited</td></tr></table></td>
        </tr>
        <tr>
            <td class="td1" colspan="2" style="width:42%"><table class="tb1"><tr><td class="bd">Insured:</td><td>${quote.first_name || ''} ${quote.middle_name || ''} ${quote.last_name || ''}</td></tr></table></td>
            <td class="td3" colspan="2" style="width:28%; border-right:none" ><table class="tb1"><tr><td class="bd">Effective Time/Date:</td></tr></table></td>
            <td class="td5"><table class="tb1"><tr><td>${new Date(quote.start_date).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})} ${new Date(quote.start_date).toLocaleDateString('en-GB')}</td></tr></table></td>
        </tr>
        <tr>
            <td class="td1" rowspan="3" colspan="2" style="width:42%"><table class="tb1"><tr><td class="bd">${firstPart}</td></tr><tr><td class="bd">${lastPart}</td></tr><tr><td class="bd">${quote.postCode}</td></tr></table></td>
            <td  class="td3" colspan="2" style="width:28%; border-right: none;"><table class="tb1"><tr><td class="bd">Expiry Time/Date:</td></tr></table></td>
            <td class="td5"><table class="tb1"><tr><td>${new Date(quote.end_date).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})} ${new Date(quote.end_date).toLocaleDateString('en-GB')}</td></tr></table></td>
        </tr>
        <tr>
            <td  class="td3" colspan="2" style="width:28%; border-right: none;"><table class="tb1"><tr><td class="bd">Reason for Issue:</td></tr></table></td>
            <td class="td5"><table class="tb1"><tr><td>${quote.cover_reason}</td></tr></table></td>
        </tr>
        <tr>
            <td  class="td3" colspan="2" style="width:28%; border-right: none;"><table class="tb1"><tr><td class="bd">Premium (inc. IPT):</td></tr></table></td>
            <td class="td5"><table class="tb1"><tr><td>£${Number(quote.update_price ?? quote.cpw).toFixed(2)}</td></tr></table></td>
        </tr>
        <tr>
            <td class="td1" colspan="3" style="width:56%"><table class="tb1"><tr><td style="width:40%" class="bd ud">Reason for Issue:</td> <td><span class="bd">Registration Number:</span> ${quote.reg_number} </td> </tr></table></td>
            <td class="td4" colspan="2" style="width:44%"><table class="tb1"><tr><td><span class="bd">Cover:</span> FULLY COMPREHENSIVE</td></tr></table></td>
        </tr>
        <tr>
            <td class="td1" colspan="5" style="width:100%"><table class="tb1"><tr><td style="width:20%" class="bd">Vehicle Value: </td> <td style="width:20%">${quote.vehicle_value || 'N/A'} </td><td style="width:30%" class="bd">Make and Model of Vehicle: </td> <td style="width:30%">${quote.vehicle_name}  ${quote.vehicle_model} </td> </tr></table></td>
        </tr>
      </table>
      <br>
      <table class="tb0">
        <tr>
            <td style="width:100%" class="td1">
            <table class="tb1">
                <tr><td class="bd tdl">ENDORSEMENTS APPLICABLE (Full wordings shown within ENDORSEMENTS)</td></tr><tr><td class="tdl">FCC - FULLY COMPREHENSIVE</td></tr>
                <tr><td class="tdl"><span class="bd">IMP</span> - IMPOUNDED VEHICLE</td></tr>
            </table>
            </td>
        </tr>
      </table>
      <br>
      <table class="tb0">
        <tr>
            <td style="width:100%" class="td1">
            <table class="tb1">
                <tr><td class="bd tdl ud">ENDORSEMENTS - only apply if noted in the ENDORSEMENTS APPLICABLE above</td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td class="bd tdl ud">FCC - FULLY COMPREHENSIVE COVER</td></tr>
                <tr><td>This Short Term Insurance Policy is for Fully Comprehensive cover. There is comprehensive cover for any damage to your vehicle.</td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td class="bd tdl ud">IMP - IMPOUNDED VEHICLE</td></tr>
                <tr><td>This policy of insurance can be used to release the insured vehicle which has been seized by the Police or Local Authority.</td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td class="bd tdl ud">017 - USE IN THE REPUBLIC OF IRELAND</td></tr>
                <tr><td>The Territorial Limits mentioned in your Policy are amended to allow your vehicle to be used in the Republic of Ireland with indemnity as if it were in the United Kingdom.</td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td class="bd tdl ud">065 - FOREIGN USE EXTENSION</td></tr>
                <tr><td>We will insure you for the cover shown in your schedule while your motor vehicle is being used within:</td></tr>
                <tr><td>-any country in the European Union (EU).</td></tr>
                <tr><td>-Andorra, Iceland, Liechtenstein, Norway and Switzerland.</td></tr>
                <tr><td>Full details of your Foreign Use terms and conditions are stated within the Foreign Use section of your Policy. This endorsement only applies if we have agreed and you have paid an additional premium.</td></tr>
            </table>
            </td>
        </tr>
      </table>
      <br>
      <table class="tb0">
        <tr>
            <td style="width:100%" class="td1">
            <table class="tb1">
                <tr><td class="bd ud">Important Information</td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td><span class="bd tdl ud">CONTINUOUS INSURANCE ENFORCEMENT and the MOTOR INSURANCE DATABASE</span> nformation relating to your policy will be added to the Motor Insurance Database ('MID') managed by the Motor Insurance Bureau ('MIB'). MID and the data stored on it may be used by certain statutory and/or authorised bodies including the Police, the DVLA, the DVLANI, the Insurance Fraud Bureau and other bodies permitted by law for purposes not limited to but including:</td></tr>
                <tr><td><ul><li>Electronic Licensing</li><li>Continuous Insurance Enforcement</li><li>Law enforcement (prevention, detection, apprehension and or prosecution of offenders)</li><li>The provision of government services and or other services aimed at reducing the level and incidence of uninsured driving.</li></ul></td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td>If you are involved in a road traffic accident (either in the UK, EEA or certain other territories), insurers and or the MIB may search the MID to obtain relevant information.</td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td class="tdl">Persons (including his or her appointed representatives) pursuing a claim in respect of a road traffic accident (including citizens of other countries) may also obtain information which is held on the MID. It is vital that the MID holds your correct registration number. If it is incorrectly shown on MID you are at risk of having your vehicle seized by the Police.</td></tr>
            </table>
            </td>
        </tr>
      </table>
      <br>
      <table class="tb0">
        <tr>
            <td style="width:100%" class="td1">
            <table class="tb1">
                <tr><td class="bd ud">Insurer Information</td></tr>
            </table><div style="padding:1px 0;"></div><table class="tb1">
                <tr><td>This policy is underwritten by Mulsanne Insurance Company Limited who are licensed by the Gibraltar Financial Services Commission to carry on insurance business under the Financial Services (Insurance Companies) Act 1987, and authorised co-insurers. Complete Cover Group Limited / Hyperformance Limited act as administrators on behalf of the Insurer, and are authorised and regulated by the Financial Services Authority.</td></tr>
            </table>
            </td>
        </tr>
      </table>
    `;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '15px',
            right: '15px',
            bottom: '15px',
            left: '15px'
        }
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
