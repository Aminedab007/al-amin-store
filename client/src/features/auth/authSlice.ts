// src/features/auth/authSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { apiLogin, apiLogout, apiMe, apiRegister, type ApiUser } from "./authApi";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading";
  error: string | null;
  hydrated: boolean; // ✅ on sait si /me a déjà été tenté
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  hydrated: false,
};

type RegisterPayload = { name: string; email: string; password: string };
type LoginPayload = { email: string; password: string };

function normalizeUser(u: ApiUser): AuthUser {
  return {
    id: String(u.id),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    role: u.role ? String(u.role) : undefined,
  };
}

export const registerThunk = createAsyncThunk<AuthUser, RegisterPayload, { rejectValue: string }>(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const u = await apiRegister(payload);
      return normalizeUser(u);
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Inscription impossible.");
    }
  }
);

export const loginThunk = createAsyncThunk<AuthUser, LoginPayload, { rejectValue: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const u = await apiLogin(payload);
      return normalizeUser(u);
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Connexion impossible.");
    }
  }
);

export const meThunk = createAsyncThunk<AuthUser | null, void, { rejectValue: string }>(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const u = await apiMe();
      return normalizeUser(u);
    } catch (e: any) {
      // si non connecté, on renvoie null (pas une erreur bloquante)
      if (e?.status === 401) return null;
      return rejectWithValue(e?.message ?? "Impossible de vérifier la session.");
    }
  }
);

export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiLogout();
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Déconnexion impossible.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      // register
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        state.error = null;
        state.hydrated = true;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "idle";
        state.error = (action.payload as string) ?? "Erreur inscription.";
        state.hydrated = true;
      })

      // login
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
        state.error = null;
        state.hydrated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "idle";
        state.error = (action.payload as string) ?? "Erreur connexion.";
        state.hydrated = true;
      })

      // me
      .addCase(meThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload; // null si non connecté
        state.error = null;
        state.hydrated = true;
      })
      .addCase(meThunk.rejected, (state, action) => {
        state.status = "idle";
        state.error = (action.payload as string) ?? "Erreur session.";
        state.hydrated = true;
      })

      // logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
        state.error = null;
        state.hydrated = true;
      });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (s: RootState) => s.auth.user;
export const selectAuthHydrated = (s: RootState) => s.auth.hydrated;
export const selectAuthStatus = (s: RootState) => s.auth.status;
export const selectAuthError = (s: RootState) => s.auth.error;
