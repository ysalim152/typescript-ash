import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Zap, Users, Calendar } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
          Bienvenue à l'Association Sportive Houra
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Rejoignez-nous pour des activités sportives et des entraînements de qualité. Développez vos compétences, rencontrez de nouveaux amis et restez actif !
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/activities">
            <Button size="lg">Explorer les activités</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline">Commencer</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="p-6 text-center">
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Horaire flexible</h3>
          <p className="text-gray-600">
            Choisissez parmi une variété de séances programmées tout au long de la semaine, adaptées à votre style de vie.
          </p>
        </Card>

        <Card className="p-6 text-center">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Communauté</h3>
          <p className="text-gray-600">
            Rejoignez une communauté accueillante de passionnés de sport et tissez des amitiés durables.
          </p>
        </Card>

        <Card className="p-6 text-center">
          <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Coachs professionnels</h3>
          <p className="text-gray-600">
            Apprenez auprès de coachs expérimentés, dévoués à votre développement personnel et à votre réussite.
          </p>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white rounded-lg p-12 text-center space-y-4">
        <h2 className="text-3xl font-bold">Prêt à rejoindre ?</h2>
        <p className="text-lg text-blue-100 max-w-xl mx-auto">
          Inscrivez-vous dès maintenant pour accéder à notre programme complet et réserver votre première séance.
        </p>
        <Link to="/register">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Créer un compte
          </Button>
        </Link>
      </section>
    </div>
  );
}
