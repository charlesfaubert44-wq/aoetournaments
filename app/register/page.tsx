import RegistrationForm from '@/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Register for Coupe Québec AOE2
      </h1>
      <RegistrationForm />
    </main>
  );
}
