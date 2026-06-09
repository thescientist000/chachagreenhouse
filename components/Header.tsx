import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        차차그린하우스
      </Link>
      <nav className="main-nav" aria-label="주요 메뉴">
        <Link href="/cart" className="nav-link">
          장바구니
        </Link>
        <Link href="/mypage" className="nav-link">
          마이페이지
        </Link>
        <Link href="/orders" className="nav-link">
          주문조회
        </Link>
      </nav>
    </header>
  );
}
