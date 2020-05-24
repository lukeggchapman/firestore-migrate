import { Firestore } from '@google-cloud/firestore';

export const up = async (firestore: Firestore) => {
  const batch = firestore.batch();

  /* Migrate data up */

  batch.commit();
};

export const down = async (firestore: Firestore) => {
  const batch = firestore.batch();

  /* Migrate data down */

  batch.commit();
};
