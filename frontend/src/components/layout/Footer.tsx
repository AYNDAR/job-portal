export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} JobPortal. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-blue-600">
            About
          </a>
          <a href="#" className="hover:text-blue-600">
            Privacy
          </a>
          <a href="#" className="hover:text-blue-600">
            Terms
          </a>
          <a href="#" className="hover:text-blue-600">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
