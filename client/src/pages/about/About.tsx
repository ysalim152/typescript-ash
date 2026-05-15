import { Card } from '../../components/ui/card';

export function About() {
  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">À propos de nous</h1>
        <p className="text-xl text-gray-600">
          L’Association Sportive Houra se consacre à la promotion du bien-être physique et de l’engagement communautaire par le biais d’activités sportives de qualité et d’un encadrement professionnel.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Notre Mission</h2>
        <p className="text-gray-600">
          Offrir des activités sportives accessibles et de haute qualité qui favorisent la santé, renforcent le tissu social et aident les individus à atteindre leurs objectifs de forme physique grâce à un encadrement professionnel et à des programmes inclusifs.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Nos Valeurs</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Excellence</h3>
            <p className="text-gray-600">Nous visons l'excellence dans toutes nos activités et nos services de coaching.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Inclusivité</h3>
            <p className="text-gray-600">Toute personne est la bienvenue, quels que soient son niveau de compétence ou son origine.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Communauté</h3>
            <p className="text-gray-600">Nous favorisons une communauté solidaire où les membres s'encouragent mutuellement.</p>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Pourquoi choisir ASHoura?</h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold mt-1">✓</span>
            <span>Coachs professionnels et certifiés</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold mt-1">✓</span>
            <span>Grande variété d'activités sportives</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold mt-1">✓</span>
            <span>Options d'horaires flexibles</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold mt-1">✓</span>
            <span>Communauté solidaire et accueillante</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-blue-600 font-bold mt-1">✓</span>
            <span>Options d'adhésion abordables</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
