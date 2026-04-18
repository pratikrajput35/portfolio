import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageLoader from '@/components/layout/PageLoader';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLoader />
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
