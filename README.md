# 🌙 Moonlight Jump

An advanced endless climbing platformer game with sophisticated physics and visual effects.

## 🎮 게임 소개

중력을 거슬러 달까지 올라가는 무한 점프 게임입니다. 다양한 플랫폼 타입과 동적 배경, 물리 기반 효과가 특징입니다.

## ✨ 주요 기능

### 🎯 게임플레이
- **무한 상승**: 끝없이 생성되는 플랫폼을 타고 올라가기
- **다양한 플랫폼**:
  - `═══` 일반 플랫폼
  - `↑↑↑` 스프링 플랫폼 (높이 점프)
  - `▓▓▓` 부서지는 플랫폼 (시간 제한)
  - `→→→` 움직이는 플랫폼 (모멘텀 전달)

### 🎨 비주얼 효과
- **5단계 동적 배경**: 고도에 따른 테마 변화
  - 🌍 Surface (0-800m)
  - 🌫️ Atmosphere (800-1600m) 
  - 🌌 Stratosphere (1600-2400m)
  - 🌠 Space (2400-3200m)
  - 🌑 Deep Space (3200m+)
- **파티클 시스템**: 점프, 착지, 스프링, 부서짐 효과
- **화면 흔들림**: 트라우마 기반 스크린 쉐이크
- **글래스모피즘 UI**: 현대적인 반투명 인터페이스

### ⚡ 물리 엔진
- **정밀한 충돌 감지**: 픽셀 퍼펙트 플랫폼 충돌
- **가변 점프**: 스페이스바 홀드 시간에 따른 높이 조절
- **코요테 타임**: 플랫폼에서 떨어진 후 잠시 점프 가능
- **점프 버퍼링**: 착지 직전 점프 입력 허용
- **공중 제어**: 공중에서 80% 이동 제어

### 🎵 오디오
- **사운드 효과**: 점프, 착지, 스프링 효과음
- **동적 사운드**: 플랫폼 타입별 고유 사운드

## 🕹️ 조작법

- **Spacebar**: 점프 (길게 누르면 높이 점프)
- **A / ←**: 왼쪽 이동
- **D / →**: 오른쪽 이동

## 🚀 플레이 방법

1. 브라우저에서 `index.html` 파일 열기
2. "Start Game" 버튼 클릭
3. 스페이스바로 점프하며 플랫폼 위로 올라가기
4. 높은 점수 달성을 목표로 하기

## 🛠️ 기술 스택

- **HTML5**: 게임 구조
- **CSS3**: 현대적 스타일링 (Custom Properties, Glassmorphism)
- **Vanilla JavaScript**: 게임 로직 및 물리 엔진
- **Particles.js**: 배경 파티클 효과

## 📦 프로젝트 구조

```
moonlight-jump/
├── index.html              # 메인 게임 파일
├── package.json           # 개발 의존성
├── playwright.config.js   # 테스트 설정
├── .env.playwright        # 환경 변수
└── README.md             # 프로젝트 문서
```

## 🧪 개발 & 테스트

### 로컬 서버 실행
```bash
python -m http.server 8080
```

### Playwright 테스트
```bash
npm install
npx playwright test
```

## 🎨 커스터마이징

### 물리 설정 조정
`CONFIG` 객체에서 다음 값들을 수정할 수 있습니다:
- `jumpPower`: 점프 강도 (기본: 520)
- `gravity`: 중력 (기본: 1100)
- `horizontalSpeed`: 이동 속도 (기본: 280)

### 테마 색상 변경
CSS Custom Properties에서 색상 조정:
```css
:root {
  --primary-color: #00d4ff;
  --secondary-color: #ff6b6b;
  --accent-color: #4ecdc4;
}
```

## 📈 성능 최적화

- **하드웨어 가속**: transform3d 사용
- **메모리 관리**: 오래된 플랫폼 자동 정리
- **프레임 레이트**: 60FPS 최적화
- **파티클 풀링**: 효율적인 파티클 관리

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is open source and available under the [MIT License](LICENSE).

## 🎯 향후 계획

- [ ] 멀티플레이어 모드
- [ ] 파워업 아이템
- [ ] 리더보드 시스템
- [ ] 모바일 터치 컨트롤
- [ ] 커스텀 스킨 시스템

---

🌙 **즐거운 달 여행 되세요!** 🚀