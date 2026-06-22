import type { Access } from "payload";

/** Utilisateur authentifié dans l’admin Payload. */
export const isAdmin: Access = ({ req }) => Boolean(req.user);

/** Lecture publique des contenus publiés uniquement. */
export const publishedRead: Access = ({ req }) => {
  if (req.user) return true;
  return {
    _status: {
      equals: "published",
    },
  };
};
