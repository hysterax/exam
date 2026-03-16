export interface CD {
  id:     string;
  title:  string;
  artist: string;
  copies: number;
}

export interface BorrowRecord {
  borrowId:   string;
  cdId:       string;
  title:      string;
  artist:     string;
  borrower:   string;
  borrowDate: string;
  dueDate:    string;
}
