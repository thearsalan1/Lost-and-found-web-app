import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLoginOtp(to:string,subject:string,html:string) {
  try {
    const {data,error} = await resend.emails.send({
    from:"Website <website@resend.dev>",
    to:to,
    subject:subject,
    html:html
  })
  if(error){
    return console.error({error});
  }
  console.log(data);
  
  } catch (error) {
    console.error(error);
    
  }
}