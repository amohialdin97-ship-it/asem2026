/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Smartphone, Fingerprint } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, logUserActivity } from '../../firebase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { STORE_NAME, PRIMARY_COLOR } from '../../constants';
import { User as AppUser } from '../../types';

interface LoginProps {
  onLogin: (role: 'admin' | 'user') => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1); // 1: Login/Signup, 2: OTP/Verify, 3: Password/Fingerprint
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    if (email.toLowerCase() === 'asem123') return true;
    return String(email)
      .toLowerCase()
      .match(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      );
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        if (userData.isBlocked) {
          setError('هذا الحساب محظور.');
          await auth.signOut();
        } else {
          await logUserActivity(user.uid, 'تسجيل الدخول', 'تم تسجيل الدخول بنجاح عبر Google');
          onLogin(userData.role);
        }
      } else {
        // Create new user profile for Google login
        const isAdminEmail = user.email?.toLowerCase() === 'asem123@asem.com' || user.email?.toLowerCase() === 'amohialdin97@gmail.com';
        const userData: AppUser = {
          uid: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'مستخدم',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || 'جديد',
          phoneNumber: '',
          email: user.email || '',
          role: isAdminEmail ? 'admin' : 'user',
          isBlocked: false,
          permissions: {
            maintenance: true,
            buyPhone: true,
            accounting: true,
            aiChat: true
          },
          createdAt: Date.now()
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        await logUserActivity(user.uid, 'تسجيل حساب جديد', 'تم إنشاء حساب جديد عبر Google');
        onLogin(userData.role);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('تسجيل الدخول بالبريد الإلكتروني غير مفعل في Firebase. يرجى تفعيله من لوحة التحكم، أو استخدام Google.');
      } else {
        setError('خطأ في تسجيل الدخول عبر Google.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    let trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
      return;
    }

    if (trimmedEmail.toLowerCase() === 'asem123') {
      trimmedEmail = 'asem123@asem.com';
    }
    
    if (!validateEmail(trimmedEmail)) {
      setError('صيغة البريد الإلكتروني غير صحيحة.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        if (userData.isBlocked) {
          setError('هذا الحساب محظور.');
          await auth.signOut();
        } else {
          await logUserActivity(userCredential.user.uid, 'تسجيل الدخول', 'تم تسجيل الدخول بنجاح');
          onLogin(userData.role);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('تسجيل الدخول بالبريد الإلكتروني غير مفعل في Firebase. يرجى تفعيله من لوحة التحكم، أو استخدام Google.');
      } else {
        setError('خطأ في تسجيل الدخول. تأكد من البيانات.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    let trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('يرجى إدخال اسم المستخدم أو البريد الإلكتروني.');
      return;
    }

    if (trimmedEmail.toLowerCase() === 'asem123') {
      trimmedEmail = 'asem123@asem.com';
    }

    if (!validateEmail(trimmedEmail)) {
      setError('صيغة البريد الإلكتروني غير صحيحة.');
      return;
    }

    if (isSignup && (!firstName || !lastName || !phone)) {
      setError('يرجى ملء جميع الحقول.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      const isAdminEmail = trimmedEmail.toLowerCase() === 'asem123@asem.com';
      const userData: AppUser = {
        uid: user.uid,
        firstName,
        lastName,
        phoneNumber: phone,
        email: trimmedEmail,
        role: isAdminEmail ? 'admin' : 'user',
        isBlocked: false,
        permissions: {
          maintenance: true,
          buyPhone: true,
          accounting: true,
          aiChat: true
        },
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      await logUserActivity(user.uid, 'تسجيل حساب جديد', 'تم إنشاء حساب جديد بنجاح');
      onLogin(userData.role);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('تسجيل الدخول بالبريد الإلكتروني غير مفعل في Firebase. يرجى تفعيله من لوحة التحكم، أو استخدام Google.');
      } else {
        setError('خطأ في إنشاء الحساب.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 gap-8" dir="rtl">
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-4 animate-bounce">
        <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center shadow-xl shadow-red-100">
          <Smartphone className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-center" style={{ color: PRIMARY_COLOR }}>
          {STORE_NAME}
        </h1>
      </div>

      <Card className="w-full max-w-md p-8 flex flex-col gap-6">
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-center mb-4">
              {isSignup ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            
            <div className="flex flex-col gap-4">
              {isSignup && (
                <div className="flex gap-2">
                  <Input placeholder="الاسم الأول" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <Input placeholder="الاسم الأخير" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              )}
              <Input 
                placeholder="اسم المستخدم أو البريد الإلكتروني" 
                type="text" 
                className="text-left" 
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input 
                placeholder="كلمة المرور" 
                type="password" 
                className="text-left" 
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isSignup && (
                <Input 
                  placeholder="رقم الهاتف" 
                  type="tel" 
                  className="text-left" 
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <Button 
              fullWidth 
              className="py-4 text-lg" 
              onClick={isSignup ? handleSignup : handleLogin}
              disabled={loading}
            >
              {loading ? 'جاري المعالجة...' : (isSignup ? 'إنشاء حساب' : 'دخول')}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">أو</span>
              </div>
            </div>

            <Button 
              variant="outline"
              fullWidth 
              className="py-3 flex items-center justify-center gap-2 border-gray-200"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              تسجيل الدخول عبر Google
            </Button>

            {!isSignup && (
              <div className="flex flex-col items-center gap-2">
                <button className="text-xs text-gray-500 hover:text-red-600">تغيير كلمة السر؟</button>
                <button 
                  className="text-sm font-bold text-red-600"
                  onClick={() => setIsSignup(true)}
                >
                  إنشاء حساب جديد
                </button>
              </div>
            )}

            {isSignup && (
              <button 
                className="text-sm font-bold text-gray-500"
                onClick={() => setIsSignup(false)}
              >
                لديك حساب بالفعل؟ تسجيل دخول
              </button>
            )}
          </>
        )}

        {/* Step 2 and 3 are kept for UI flow but simplified for this demo */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-center mb-2">تأكيد الحساب</h2>
            <p className="text-xs text-gray-500 text-center mb-6">تم إرسال رمز التأكيد إلى واتساب الخاص بك</p>
            <Input placeholder="رمز التأكيد" className="text-center text-2xl tracking-widest" maxLength={6} />
            <Button fullWidth className="mt-4" onClick={() => setStep(3)}>تأكيد</Button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-bold text-center mb-6">إعدادات الأمان</h2>
            <div className="flex flex-col gap-4">
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all">
                <Fingerprint className="w-12 h-12 text-gray-400" />
                <span className="text-sm font-bold text-gray-500">تفعيل البصمة</span>
              </div>
            </div>
            <Button fullWidth className="mt-6 py-4" onClick={() => {
              const trimmedEmail = email.trim().toLowerCase();
              onLogin(trimmedEmail === 'asem123' || trimmedEmail === 'asem123@asem.com' ? 'admin' : 'user');
            }}>إتمام التسجيل</Button>
          </>
        )}
      </Card>
    </div>
  );
};

