import { initializeApp } from "firebase/app";
import { doc, getFirestore, collection, setDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { QueryDocumentSnapshot, SnapshotOptions } from "@firebase/firestore";
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

const genericConverter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot<T>, options: SnapshotOptions) => snapshot.data(options)
});


//NOTE: 중복된 이름으로 생성 불가능 하게 만들어야 함.
export async function createCategories(scheduleCategory: ScheduleCategory) {
  try {
    const ref = doc(db, "category", scheduleCategory.name).withConverter(genericConverter<ScheduleCategory>());
    await setDoc(ref, scheduleCategory);
  } catch (e) {
    throw new Error("createCategories firestore error");
  }
}

export async function getCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "category").withConverter(genericConverter<ScheduleCategory>()));
    const ret: ScheduleCategory[] = [];
    querySnapshot.forEach(snapshot => ret.push(snapshot.data()));
    return ret;
  } catch {
    throw new Error("getCategories firestore error");
  }
}

export async function appendScheduleList(category: ScheduleCategory, schedule: Schedule) {
  try {
    const ref = doc(db, "schedules", schedule.key).withConverter(genericConverter<ScheduleData>());
    await setDoc(ref, {
      key: schedule.key,
      title: schedule.title,
      notes: schedule.notes,
      isCompleted: schedule.isCompleted,
      category
    });
  } catch (e) {
    console.error(e);
    throw new Error("appendScheduleList firestore error");
  }
}

export async function getScheduleList(category: ScheduleCategory) {
  try {
    const querySnapshot =
      await getDocs(query(collection(db, "schedules"), where("category", "==", category)).withConverter(genericConverter<ScheduleData>()));
    const ret: ScheduleData[] = [];
    querySnapshot.forEach(snapshot => ret.push(snapshot.data()));
    return ret;
  } catch {
    throw new Error("getScheduleList firestore error");
  }
}

export async function deleteSchedule(schedule: Schedule) {
  try {
    await deleteDoc(doc(db, "schedules", schedule.key));
    return schedule;
  } catch {
    throw new Error("deleteSchedule firestore error");
  }
}
