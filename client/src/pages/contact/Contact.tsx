import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Contactez-nous</h1>
        <p className="text-gray-600">Prenez contact avec l'Association Sportive Houra</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          <h3 className="font-bold mb-2">Email</h3>
          <p className="text-gray-600 text-sm">contact@association-houra.dz</p>
        </Card>
        <Card className="p-6 text-center">
          <Phone className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          <h3 className="font-bold mb-2">Téléphone</h3>
          <p className="text-gray-600 text-sm">+213 (0) 5 53 41 94 05</p>
        </Card>
        <Card className="p-6 text-center">
          <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          <h3 className="font-bold mb-2">Adresse</h3>
          <p className="text-gray-600 text-sm">Houra, Bouzeguene, Tizi-Ouzou</p>
        </Card>
      </div>

      <Card className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Message envoyé avec succès ! Nous vous répondrons prochainement.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Envoyer un message'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
