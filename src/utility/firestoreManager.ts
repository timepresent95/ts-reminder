import { initializeApp } from "firebase/app";
import { doc, getFirestore, collection, setDoc, getDocs, deleteDoc } from "firebase/firestore";
import { DocumentReference } from "@firebase/firestore";
import Schedule from "../component/Schedule";

const firebaseConfig = {
  apiKey: process.env.FIRE_STORE_API_KEY,
  authDomain: process.env.FIRE_STORE_AUTH_DOMAIN,
  projectId: process.env.FIRE_STORE_PROJECT_ID,
  storageBucket: process.env.FIRE_STORE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIRE_STORE_MESSAGING_SENCDER_ID,
  appId: process.env.FIRE_STORE_APP_ID,
  measurementId: process.env.FIRE_STORE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

async function getCategoryDocumentRef(category: string): Promise<DocumentReference> {
  const querySnapshot = await getDocs(collection(db, "category"));
  let ret: DocumentReference | null = null;
  querySnapshot.forEach(snapshot => {
    if (snapshot.data().title === category) {
      ret = snapshot.ref;
    }
  });
  if (ret === null) {
    throw new Error(`${category} category is not exist`);
  }
  return ret;
}

export async function getCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "category"));
    const ret: string[] = [];
    querySnapshot.forEach(snapshot => {
      ret.push(snapshot.data().title);
    });
    return ret;
  } catch {
    throw new Error("firestore error");
  }
}

export async function appendScheduleList(category: string, schedule: Schedule) {
  try {
    const categoryDocumentRef = await getCategoryDocumentRef(category);
    await setDoc(doc(categoryDocumentRef, "scheduleList", schedule.key), {
      title: schedule.title,
      notes: schedule.notes,
      isCompleted: schedule.isCompleted
    });
  } catch {
    throw new Error("firestore error");
  }
}

export async function getScheduleList(category: string) {
  try {
    const categoryDocumentRef = await getCategoryDocumentRef(category);
    const querySnapshot = await getDocs(collection(categoryDocumentRef, "scheduleList"));
    const ret: SimplifySchedule[] = [];
    querySnapshot.forEach(snapshot => {
      const data = snapshot.data();
      ret.push({
        key: snapshot.id,
        title: data.title as string,
        notes: data.notes as string,
        isCompleted: data.isCompleted as boolean
      });
    });
    return ret;
  } catch {
    throw new Error("firestore error");
  }
}

export async function deleteSchedule(category: string, schedule: Schedule) {
  try {
    const categoryDocumentRef = await getCategoryDocumentRef(category);
    await deleteDoc(doc(categoryDocumentRef, "scheduleList", schedule.key));
    return schedule;
  } catch {
    throw new Error("firestore error");
  }
}
