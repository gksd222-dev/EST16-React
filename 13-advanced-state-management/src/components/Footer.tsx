function Footer() {
  
  const currentYear = new Date().getFullYear();
  return (
    <footer className="flex items-center justify-center py-5">
      <small lang="en" className="text-indigo-800">
        Copyright all Reserved. &copy; {currentYear}
      </small>
    </footer>
  );
}
export default Footer