class PatternFlow < Formula
  desc "Một công cụ cấu hình linh hoạt để trích xuất và định dạng dữ liệu text"
  homepage "https://github.com/DrRingo/pattern-flow"
  license "MIT"
  # Để public trên thiết bị brew macOS/linux, bạn sẽ cần biên dịch file thực thi tương ứng
  if OS.mac?
    url "https://github.com/DrRingo/pattern-flow/releases/download/1.0.0/pattern-flow-macos.tar.gz"
    sha256 "FA01F24F668706CF203BC6233BDB816822258A1033D92E4C33747C40057DA7B0"
  elsif OS.linux?
    url "https://github.com/DrRingo/pattern-flow/releases/download/1.0.0/pattern-flow-linux.tar.gz"
    sha256 "2C1D8E149C6CDA0E7779EB705B2B21D5EDF1506892307BEBF34B4E3BAF062577"
  end

  def install
    if OS.mac?
      bin.install "pattern-flow-macos" => "pattern-flow"
    elsif OS.linux?
      bin.install "pattern-flow-linux" => "pattern-flow"
    end
  end

  test do
    system "#{bin}/pattern-flow", "--version"
  end
end
