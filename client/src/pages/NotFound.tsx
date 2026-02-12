import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <Link className="text-emerald-600 underline" to="/">Retour accueil</Link>
    </div>
  );
}
