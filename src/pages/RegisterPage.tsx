import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="mt-6 text-3xl font-bold text-primary dark:text-primary-light">
            Hanoi Stock Exchange
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Đăng ký tài khoản giao dịch chứng khoán
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
