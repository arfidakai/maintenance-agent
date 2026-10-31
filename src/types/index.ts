export type Site = {
  id: string;
  name: string;
  url: string;
  created_at: string;
};

export type Task = {
  id: string;
  site_id: string;
  title: string;
  status: string;
  created_at: string;
};
