import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text
  } from "@react-email/components";

  interface VerificationEmailProps {
    username: string;
    otp: string;
  }
  
  const VerificationEmail = ({username, otp} : VerificationEmailProps) => {
    return (
      <Html>
        <Head />
        <Preview>Sign in to Silent Survey</Preview>
        <Body style={main}>
          <Container style={container}>
            <Text style={company}>Hello {username}</Text>
            <Heading style={codeTitle}>Your authentication code</Heading>
            <Text style={codeDescription}>
              Thank you for registering with us. Please use the following verification code to complete your registration.
            </Text>
            <Section style={codeContainer}>
              <Heading style={codeStyle}>{otp}</Heading>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default VerificationEmail;
  
  const main = {
    backgroundColor: "#ffffff",
    fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
    textAlign: "center" as const,
  };
  
  const container = {
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginTop: "20px",
    width: "480px",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "12% 6%",
  };
  
  const company = {
    fontWeight: "bold",
    fontSize: "18px",
    textAlign: "center" as const,
  };
  
  const codeTitle = {
    textAlign: "center" as const,
  };
  
  const codeDescription = {
    textAlign: "center" as const,
  };
  
  const codeContainer = {
    background: "rgba(0,0,0,.05)",
    borderRadius: "4px",
    margin: "16px auto 14px",
    verticalAlign: "middle",
    width: "280px",
    maxWidth: "100%",
  };
  
  const codeStyle = {
    color: "#000",
    display: "inline-block",
    paddingBottom: "8px",
    paddingTop: "8px",
    margin: "0 auto",
    width: "100%",
    textAlign: "center" as const,
    letterSpacing: "8px",
  };
  
  