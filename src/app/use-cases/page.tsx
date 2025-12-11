import Navigation from '@/components/Navigation'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'

export default function UseCasesPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navigation />
            <div className="pt-20">
                <Testimonials />
            </div>
            <Footer />
        </main>
    )
}
