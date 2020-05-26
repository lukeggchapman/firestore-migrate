interface Migration {
  version: string;
}

class MigrationStore {
  constructor(private firestore: FirebaseFirestore.Firestore) {}

  private getDocument() {
    return this.firestore.doc('config/migration');
  }

  update(data: Migration) {
    return this.getDocument().set(data, { merge: true });
  }

  async get(): Promise<Migration | undefined> {
    const snapshot = await this.getDocument().get();
    return snapshot.data() as any;
  }
}

export default MigrationStore;
