
import Link from 'next/link';
import { Copyright, Heart } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="w-full mt-auto p-4 text-center">
            <div className="container mx-auto text-xs text-muted-foreground data-footer">
                <p>&copy; {currentYear} BlockShadow. Don't blame the AI if you lose your shirt. Results may vary.</p>
                <p>For intel, feedback, or to question our sentience, visit <Link href="https://blockshadow.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent underline">BlockShadow.com</Link></p>
            </div>
        </footer>
    );
};

export default Footer;
