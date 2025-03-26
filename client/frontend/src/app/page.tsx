import SearchFile from "./components/search";
import FileUpload from "./components/upload";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SearchFile />
      {/* <FileUpload /> */}
    </div>
  );
}
