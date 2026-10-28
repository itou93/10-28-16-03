const deptNames = {
    'stamp-a': '電子機械科',
    'stamp-b': '情報技術科',
    'stamp-c': '情報処理科',
    'stamp-d': '服飾デザイン科',
    'stamp-e': '食物調理科',
    'stamp-f': '流通経済科'
};

let clickCount = 0;
let clickTimer = null;

// 来場者向けの案内メッセージ＆ボタン表示制御
function updateSoftLog(status, message, isSuccess = true) {
    const statusEl = document.getElementById('log-status');
    const msgEl = document.getElementById('log-message');
    const btnEl = document.getElementById('btn-to-test');

    if (statusEl && msgEl) {
        statusEl.textContent = status;
        if (isSuccess) {
            statusEl.style.background = '#d1fae5';
            statusEl.style.color = '#047857';
            // マーカー検出時のみ 3D体験画面への移動ボタンを表示
            if (btnEl) btnEl.style.display = 'block';
        } else {
            statusEl.style.background = '#e2e8f0';
            statusEl.style.color = '#475569';
            // マーカーを見失っている時はボタンを隠す
            if (btnEl) btnEl.style.display = 'none';
        }
        msgEl.textContent = message;
    }
}

// 重なり防止のため自動ポップアップ処理を停止
function showNearObjectLog() {
    return;
}

// 動画の自動再生（タップ時のミュート解除準備対応）
function handlePlayVideo(markerElem, path) {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
        const src = v.getAttribute('src');
        if (src && src.includes(path)) {
            v.muted = true;
            v.play().then(() => {
                const aVideo = markerElem.querySelector('a-video');
                if (aVideo) {
                    const mesh = aVideo.getObject3D('mesh');
                    if (mesh && mesh.material && mesh.material.map) {
                        mesh.material.map.needsUpdate = true;
                    }
                }
            }).catch(e => console.log("再生エラー:", e));
        }
    });
}

function handlePauseVideo(path) {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
        const src = v.getAttribute('src');
        if (src && src.includes(path)) {
            v.pause();
        }
    });
}

// WebARのカメラストリームを完全に停止して許可再要求を防ぐ関数
function stopWebcamStream() {
    try {
        const videoElems = document.querySelectorAll('video');
        videoElems.forEach(video => {
            if (video.srcObject) {
                const stream = video.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
        });
    } catch (e) {
        console.warn("カメラ停止処理エラー:", e);
    }
}

// マーカーイベントのバインド（動的追加対応）
function bindMarkerEvents() {
    // --- マーカー1 ---
    const m1 = document.getElementById('ar-marker-1');
    if (m1) {
        m1.addEventListener('markerFound', function() {
            console.log("検出成功: ar-marker-1");
            try { localStorage.setItem('stamp-a-flag', '1'); } catch(e){}

            updateSoftLog('検出成功！', '🎉 マーカーを読み取りました！近くの対象をスキャンしてみよう', true);
            handlePlayVideo(this, 'jgvideo2.mp4');
        });

        m1.addEventListener('markerLost', function() {
            console.log("マーカー喪失: ar-marker-1");
            updateSoftLog('スキャン中', '近くに読み取れるものがあるかも！ボタンを押してみよう', false);
            handlePauseVideo('jgvideo2.mp4');
        });
    }

    // --- マーカー2 ---
    const m2 = document.getElementById('ar-marker-2');
    if (m2) {
        m2.addEventListener('markerFound', function() {
            console.log("検出成功: ar-marker-2");
            try { localStorage.setItem('stamp-b-flag', '1'); } catch(e){}

            updateSoftLog('検出成功！', '🎉 マーカーを読み取りました！近くの対象をスキャンしてみよう', true);
            handlePlayVideo(this, 'GameVideo.mp4');
        });

        m2.addEventListener('markerLost', function() {
            console.log("マーカー喪失: ar-marker-2");
            updateSoftLog('スキャン中', '近くに読み取れるものがあるかも！ボタンを押してみよう', false);
            handlePauseVideo('GameVideo.mp4');
        });
    }

    // --- マーカー3 ---
    const m3 = document.getElementById('ar-marker-3');
    if (m3) {
        m3.addEventListener('markerFound', function() {
            console.log("検出成功: ar-marker-3");
            try { localStorage.setItem('stamp-c-flag', '1'); } catch(e){}

            updateSoftLog('検出成功！', '🎉 マーカーを読み取りました！近くの対象をスキャンしてみよう', true);
            handlePlayVideo(this, 'jgvideo2.mp4');
        });

        m3.addEventListener('markerLost', function() {
            console.log("マーカー喪失: ar-marker-3");
            updateSoftLog('スキャン中', '近くに読み取れるものがあるかも！ボタンを押してみよう', false);
            handlePauseVideo('jgvideo2.mp4');
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const unlockAudio = () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
            if (!v.paused) v.muted = false;
        });
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // 既に a-scene が存在している場合のイベントバインド（初期状態になければ startAR でバインド）
    bindMarkerEvents();
});

// ページ離脱時にカメラを完全に破棄
window.addEventListener('beforeunload', () => {
    stopWebcamStream();
});

function goBack() {
    stopWebcamStream();
    window.location.href = 'index.html';
}

function switchToMarkerless() {
    stopWebcamStream();
    window.location.href = 'test.html';
}

// 説明画面の「Next ➔」を押して初めてカメラを起動
function startAR() {
    const screen = document.getElementById('explanation-screen');
    if (screen) {
        screen.remove();
    }

    const container = document.getElementById('ar-container');
    if (container && !document.getElementById('ar-scene')) {
        container.innerHTML = `
            <a-scene 
                id="ar-scene"
                embedded 
                arjs="sourceType: webcam; debugUIEnabled: false; patternRatio: 0.7; trackingMethod: best;" 
                vr-mode-ui="enabled: false">
            
                <a-entity light="type: ambient; color: #ffffff; intensity: 1.8;"></a-entity>

                <a-marker type="pattern" url="./pattern-koshou.patt" patternRatio="0.7" id="ar-marker-1"></a-marker>
                <a-marker type="pattern" url="./pattern-JGmaeker.patt" patternRatio="0.7" id="ar-marker-2"></a-marker>
                <a-marker type="pattern" url="./pattern-j.patt" patternRatio="0.7" id="ar-marker-3"></a-marker>

                <a-entity camera></a-entity>
            </a-scene>
        `;

        // 動的に追加した要素へマーカー検出イベントを登録
        setTimeout(() => {
            bindMarkerEvents();
        }, 300);
    }
}

function openCollection() {
    const modal = document.getElementById('collection-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCollection() {
    const modal = document.getElementById('collection-modal');
    if (modal) modal.style.display = 'none';
}

function selectDepartment(deptKey) {
    openDeptVideos(deptKey);
}

function openDeptVideos(deptKey) {
    const modal = document.getElementById('dept-video-modal');
    const title = document.getElementById('dept-title');
    const list = document.getElementById('dept-video-list');
    
    if (title) title.textContent = `${deptNames[deptKey] || '学科'} の動画一覧`;
    
    if (list) {
        list.innerHTML = '';

        const spots = [
            { id: 'stamp-a-flag', title: 'スポット1：校章スポット', src: 'jgvideo2.mp4' },
            { id: 'stamp-b-flag', title: 'スポット2：シューティングゲーム', src: 'GameVideo.mp4' },
            { id: 'stamp-c-flag', title: 'スポット3：丸型スポット', src: 'jgvideo2.mp4' }
        ];

        spots.forEach(spot => {
            let isUnlocked = false;

            try {
                isUnlocked = (localStorage.getItem(spot.id) === '1');
            } catch (e) {
                isUnlocked = false;
            }

            const div = document.createElement('div');
            div.className = `video-item ${isUnlocked ? 'unlocked' : 'locked'}`;

            if (isUnlocked) {
                div.innerHTML = `
                    <p style="font-weight:bold; margin:0 0 8px 0; color:#059669;">🔓 ${spot.title}</p>
                    <video src="${spot.src}" controls style="width:100%; border-radius:8px; display:block;"></video>
                `;
            } else {
                div.innerHTML = `
                    <p style="font-weight:bold; margin:0; color:#475569;">🔒 ${spot.title}</p>
                    <div class="secret-box" style="background:#cbd5e1; border-radius:10px; padding:20px; text-align:center; margin-top:8px;">
                        <div class="secret-icon" style="font-size:36px; font-weight:bold; color:#64748b; margin-bottom:4px;">❓</div>
                        <small style="color:#64748b; font-weight:bold;">ARマーカーを探して解放しよう！</small>
                    </div>
                `;
            }
            list.appendChild(div);
        });
    }
    
    const collectionModal = document.getElementById('collection-modal');
    if (collectionModal) collectionModal.style.display = 'none';
    if (modal) modal.style.display = 'flex';
}

function closeDeptVideos() {
    const deptModal = document.getElementById('dept-video-modal');
    const collectionModal = document.getElementById('collection-modal');
    
    if (deptModal) {
        const videos = deptModal.querySelectorAll('video');
        videos.forEach(v => v.pause());
        deptModal.style.display = 'none';
    }
    
    if (collectionModal) {
        collectionModal.style.display = 'flex';
    }
}

function handleTitleClick() {
    clickCount++;
    clearTimeout(clickTimer);

    if (clickCount >= 5) {
        clickCount = 0;
        if (confirm('【開発者コマンド】スタンプと解放状況を全リセットしますか？')) {
            try { localStorage.clear(); } catch(e){}
            alert('すべての進行状況をリセットしました！');
            location.reload();
        }
    } else {
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 1500);
    }
}