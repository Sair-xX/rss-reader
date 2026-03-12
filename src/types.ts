export type FeedEntry = {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceId: string;
  pubDate: string;
  bookmarked: boolean;
};

export type FeedSource = {
  id: string;
  url: string;
  label: string;
};