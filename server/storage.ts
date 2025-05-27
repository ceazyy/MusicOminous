import { users, albums, type User, type InsertUser, type Album, type InsertAlbum } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllAlbums(): Promise<Album[]>;
  getAlbum(id: number): Promise<Album | undefined>;
  createAlbum(album: InsertAlbum): Promise<Album>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private albums: Map<number, Album>;
  private currentUserId: number;
  private currentAlbumId: number;

  constructor() {
    this.users = new Map();
    this.albums = new Map();
    this.currentUserId = 1;
    this.currentAlbumId = 1;
    
    // Initialize with CEAZY albums
    this.initializeAlbums();
  }

  private async initializeAlbums() {
    // Wicked Generation - Coming June 26, 2025
    await this.createAlbum({
      title: "WICKED GENERATION",
      catalog: "CEAZY",
      coverImage: "/src/assets/NS008.jpg",
      releaseDate: "2025-06-26",
      price: null,
      isReleased: false,
      previewUrl: null,
      purchaseUrl: null,
    });

    // Evolution - Already released
    await this.createAlbum({
      title: "EVOLUTION",
      catalog: "CEAZY",
      coverImage: "/src/assets/EVOLUTION.png",
      releaseDate: "2024-12-01",
      price: "5.00",
      isReleased: true,
      previewUrl: "/preview/evolution.mp3",
      purchaseUrl: "/purchase/evolution",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllAlbums(): Promise<Album[]> {
    return Array.from(this.albums.values());
  }

  async getAlbum(id: number): Promise<Album | undefined> {
    return this.albums.get(id);
  }

  async createAlbum(insertAlbum: InsertAlbum): Promise<Album> {
    const id = this.currentAlbumId++;
    const album: Album = {
      ...insertAlbum,
      id,
      releaseDate: insertAlbum.releaseDate ?? null,
      price: insertAlbum.price ?? null,
      isReleased: insertAlbum.isReleased ?? null,
      previewUrl: insertAlbum.previewUrl ?? null,
      purchaseUrl: insertAlbum.purchaseUrl ?? null
    };
    this.albums.set(id, album);
    return album;
  }
}

export const storage = new MemStorage();
