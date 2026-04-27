// // import { useEffect, useState } from "react";

// // import { apiFetch } from "../api/api";

// // import LoadingScreen from "./LoadingScreen";
// // import BlockedScreen from "./BlockedScreen";

// // import AdminDashboard from "../dashboards/AdminDashboard";
// // import StaffDashboard from "../dashboards/StaffDashboard";
// // import CustomerDashboard from "../dashboards/CustomerDashboard";

// // export default function AuthGate() {
// //   const [loading, setLoading] = useState(true);

// //   const [user, setUser] = useState(null);

// //   const [blocked, setBlocked] = useState(false);

// //   useEffect(() => {
// //     async function loadUser() {
// //       try {
// //         const email =
// //           localStorage.getItem("devEmail");

// //         if (!email) {
// //           const entered = prompt(
// //             "Enter your email"
// //           );

// //           localStorage.setItem(
// //             "devEmail",
// //             entered
// //           );
// //         }

// //         const data = await apiFetch("/auth/me");

// //         setUser(data.user);
// //       } catch (error) {
// //         if (error.blocked) {
// //           setBlocked(true);
// //         }
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     loadUser();
// //   }, []);

// //   if (loading) {
// //     return <LoadingScreen />;
// //   }

// //   if (blocked) {
// //     return <BlockedScreen />;
// //   }

// //   if (!user) {
// //     return <BlockedScreen />;
// //   }

// //   if (user.role === "admin") {
// //     return <AdminDashboard user={user} />;
// //   }

// //   if (user.role === "staff") {
// //     return <StaffDashboard user={user} />;
// //   }

// //   return <CustomerDashboard user={user} />;
// // }

// import { useEffect, useState } from "react";

// import { apiFetch } from "../api/api";

// import LoginScreen from "./LoginScreen";
// import LoadingScreen from "./LoadingScreen";
// import BlockedScreen from "./BlockedScreen";

// import AdminDashboard from "../dashboards/AdminDashboard";
// import StaffDashboard from "../dashboards/StaffDashboard";
// import CustomerDashboard from "../dashboards/CustomerDashboard";

// export default function AuthGate() {
//   const [loading, setLoading] = useState(false);
//   const [needsLogin, setNeedsLogin] = useState(false);
//   const [user, setUser] = useState(null);
//   const [blocked, setBlocked] = useState(false);

//   async function loadUser() {
//     try {
//       setLoading(true);
//       setBlocked(false);

//       const email = localStorage.getItem("devEmail");

//       if (!email) {
//         setNeedsLogin(true);
//         setLoading(false);
//         return;
//       }

//       const data = await apiFetch("/auth/me");

//       setUser(data.user);
//       setNeedsLogin(false);
//     } catch (error) {
//       console.error("Auth error:", error);

//       if (error.blocked) {
//         setBlocked(true);
//       } else {
//         localStorage.removeItem("devEmail");
//         setNeedsLogin(true);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadUser();
//   }, []);

//   if (loading) {
//     return <LoadingScreen />;
//   }

//   if (needsLogin) {
//     return <LoginScreen onLogin={loadUser} />;
//   }

//   if (blocked) {
//     return <BlockedScreen />;
//   }

//   if (!user) {
//     return <LoginScreen onLogin={loadUser} />;
//   }

//   if (user.role === "admin") {
//     return <AdminDashboard user={user} />;
//   }

//   if (user.role === "staff") {
//     return <StaffDashboard user={user} />;
//   }

//   if (user.role === "customer") {
//     return <CustomerDashboard user={user} />;
//   }

//   return <BlockedScreen />;
// }


import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { apiFetch } from "../api/api";
import { auth } from "../firebase/firebase";

import LoginScreen from "./LoginScreen";
import LoadingScreen from "./LoadingScreen";
import BlockedScreen from "./BlockedScreen";

import AdminDashboard from "../dashboards/AdminDashboard";
import StaffDashboard from "../dashboards/StaffDashboard";
import CustomerDashboard from "../dashboards/CustomerDashboard";

export default function AuthGate() {
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [blocked, setBlocked] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setBlocked(false);

      const hasFirebaseUser = Boolean(auth.currentUser);
      const hasDevEmail = Boolean(localStorage.getItem("devEmail"));

      if (!hasFirebaseUser && !hasDevEmail) {
        setNeedsLogin(true);
        setLoading(false);
        return;
      }

      const data = await apiFetch("/auth/me");

      setUser(data.user);
      setNeedsLogin(false);
    } catch (error) {
      console.error("Auth error:", error);

      if (error.blocked) {
        setBlocked(true);
      } else {
        setNeedsLogin(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      loadUser();
    });

    return () => unsubscribe();
  }, [loadUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (needsLogin) {
    return <LoginScreen onLogin={loadUser} />;
  }

  if (blocked) {
    return <BlockedScreen />;
  }

  if (!user) {
    return <LoginScreen onLogin={loadUser} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard user={user} />;
  }

  if (user.role === "staff") {
    return <StaffDashboard user={user} />;
  }

  if (user.role === "customer") {
    return <CustomerDashboard user={user} />;
  }

  return <BlockedScreen />;
}