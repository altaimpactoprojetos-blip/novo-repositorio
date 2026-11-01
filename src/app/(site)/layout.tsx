import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { getAllContent } from "@/lib/queries";
import { whatsappLink } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { contact, settings } = await getAllContent();
  const wa = whatsappLink(contact.whatsapp_number, contact.whatsapp_message);
  return (
    <>
      <Header instagramUrl={contact.instagram_url || undefined} />
      <main id="conteudo">{children}</main>
      <Footer contact={contact} settings={settings} />
      {wa && <WhatsAppFloat href={wa} />}
    </>
  );
}
