document.addEventListener('DOMContentLoaded', () => {
    // --- グローバル変数・定数 ---
    const playerEntriesContainer = document.getElementById('playerEntries');
    const addPlayerButton = document.getElementById('addPlayerButton');
    const generateTeamsButton = document.getElementById('generateTeamsButton');
    const attackerPlayersUl = document.getElementById('attackerPlayers');
    const defenderPlayersUl = document.getElementById('defenderPlayers');
    const attackerRankSumSpan = document.getElementById('attackerRankSum');
    const defenderRankSumSpan = document.getElementById('defenderRankSum');
    const mapNameP = document.getElementById('mapName');
    const mapImageImg = document.getElementById('mapImage');
    const copyResultButton = document.getElementById('copyResultButton');
    const resultTextTextarea = document.getElementById('resultText');

    // 設定モーダル関連
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsButton = document.getElementById('openSettingsButton');
    const closeSettingsButton = document.getElementById('closeSettingsButton');
    const rankSettingsContainer = document.getElementById('rankSettingsContainer');
    const addRankButton = document.getElementById('addRankButton');
    const saveRankSettingsButton = document.getElementById('saveRankSettingsButton');
    const mapSelectionContainer = document.getElementById('mapSelectionContainer');
    const saveMapSettingsButton = document.getElementById('saveMapSettingsButton');
    const resetTeamsButton = document.getElementById('resetTeamsButton');
    const resetAllDataButton = document.getElementById('resetAllDataButton');


    let players = []; // 全ての登録プレイヤー（チェック状態含む）
    let rankTiers = [
        { name: 'A+', value: 5 },
        { name: 'A', value: 4 },
        { name: 'B+', value: 3 },
        { name: 'B', value: 2 },
        { name: 'C', value: 1 }
    ];

    let allMaps = [
        { name: 'バインド', file: 'Loading_Screen_Bind.webp', selected: true },
        { name: 'ヘイブン', file: 'Loading_Screen_Haven.webp', selected: true },
        { name: 'スプリット', file: 'Loading_Screen_Split.webp', selected: true },
        { name: 'アセント', file: 'Loading_Screen_Ascent.webp', selected: true },
        { name: 'アイスボックス', file: 'Loading_Screen_Icebox.webp', selected: true },
        { name: 'ブリーズ', file: 'Loading_Screen_Breeze.webp', selected: true },
        { name: 'フラクチャー', file: 'Loading_Screen_Fracture.webp', selected: true },
        { name: 'パール', file: 'Loading_Screen_Pearl.webp', selected: true },
        { name: 'ロータス', file: 'Loading_Screen_Lotus.webp', selected: true },
        { name: 'サンセット', file: 'Loading_Screen_Sunset.webp', selected: true },
        { name: 'アビス', file: 'Loading_Screen_Abyss.webp', selected: true },
        { name: 'カロード', file: 'Loading_Screen_Corrode.webp', selected: true }
    ];
    let selectedMap = null;

    // --- 初期化処理 ---
    loadData(); // ローカルストレージからデータを読み込む
    renderPlayerInputs();
    renderRankSettings();
    renderMapSelection();
    addInitialPlayerEntries(); // 初期プレイヤー入力欄を数個表示

    // --- イベントリスナー ---
    addPlayerButton.addEventListener('click', () => {
        // プレイヤー追加数の制限を撤廃
        addPlayerEntry("", rankTiers[rankTiers.length > 0 ? rankTiers.length - 1 : 0].name, undefined, true); // 新規追加時はデフォルトでチェックON
        savePlayers();
    });

    generateTeamsButton.addEventListener('click', generateTeamsAndMap);

    openSettingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeSettingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => { // モーダル外クリックで閉じる
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    addRankButton.addEventListener('click', addNewRankSettingInput);
    saveRankSettingsButton.addEventListener('click', saveRankSettings);
    saveMapSettingsButton.addEventListener('click', saveMapSettings);
    resetTeamsButton.addEventListener('click', resetTeamDisplay);

    copyResultButton.addEventListener('click', copyResultToClipboard);
    resetAllDataButton.addEventListener('click', resetAllApplicationData);


    // --- 関数定義 ---

    function addInitialPlayerEntries() {
        const existingPlayers = players.length;
        if (existingPlayers === 0) { // 既存のプレイヤーデータがない場合のみ初期入力欄を追加
            const defaultRankName = rankTiers.length > 0 ? rankTiers[rankTiers.length - 1].name : ""; // 最低ランク
            for (let i = 0; i < 5; i++) { // 初期は5人分の入力欄を用意
                addPlayerEntry("", defaultRankName, undefined, true); // デフォルトでチェックON
            }
        }
    }


    /**
     * プレイヤー入力欄をDOMに追加する
     * @param {string} name - プレイヤー名
     * @param {string} rankName - ランク名
     * @param {string} id - プレイヤーID
     * @param {boolean} selected - 参加/不参加 (チェックボックスの状態)
     */
    function addPlayerEntry(name = "", rankName = rankTiers[0]?.name || "", id = Date.now() + Math.random(), selected = true) {
        const playerEntryDiv = document.createElement('div');
        playerEntryDiv.classList.add('player-entry');
        playerEntryDiv.dataset.id = id;

        // 【変更】参加チェックボックス
        const selectedCheckbox = document.createElement('input');
        selectedCheckbox.type = 'checkbox';
        selectedCheckbox.checked = selected;
        selectedCheckbox.classList.add('player-select-checkbox');
        selectedCheckbox.title = 'チーム分けに参加する';
        selectedCheckbox.addEventListener('change', savePlayers); // 変更時に保存

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'プレイヤー名';
        nameInput.value = name;
        nameInput.addEventListener('change', savePlayers);

        const rankSelect = document.createElement('select');
        rankTiers.forEach(tier => {
            const option = document.createElement('option');
            option.value = tier.name;
            option.textContent = `${tier.name} (${tier.value})`;
            if (tier.name === rankName) {
                option.selected = true;
            }
            rankSelect.appendChild(option);
        });
        rankSelect.addEventListener('change', savePlayers);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.classList.add('delete-player-button');
        deleteButton.addEventListener('click', () => {
            playerEntriesContainer.removeChild(playerEntryDiv);
            savePlayers(); // 削除後も保存
        });

        playerEntryDiv.appendChild(selectedCheckbox); // 【変更】チェックボックスを追加
        playerEntryDiv.appendChild(nameInput);
        playerEntryDiv.appendChild(rankSelect);
        playerEntryDiv.appendChild(deleteButton);
        playerEntriesContainer.appendChild(playerEntryDiv);
    }

    /**
     * 【変更】DOMから全プレイヤー情報を収集し、グローバルの players 配列を更新する
     * チェックボックスの状態も 'selected' プロパティとして保存する
     */
    function collectPlayersData() {
        players = [];
        const entries = playerEntriesContainer.querySelectorAll('.player-entry');
        entries.forEach(entry => {
            const name = entry.querySelector('input[type="text"]').value.trim();
            const rankName = entry.querySelector('select').value;
            const rankValue = rankTiers.find(r => r.name === rankName)?.value || 0;
            const selected = entry.querySelector('.player-select-checkbox').checked; // 【変更】チェックボックスの状態を取得
            
            // 名前が入力されているプレイヤーのみを保存対象とする
            if (name) { 
                players.push({
                    id: entry.dataset.id,
                    name: name,
                    rankName: rankName,
                    rankValue: rankValue,
                    selected: selected // 【変更】selected 状態を保存
                });
            }
        });
    }

    /**
     * 【変更】チーム分けとマップ選択を実行する
     * チェックボックスで選択されたプレイヤーのみを対象とする
     */
    function generateTeamsAndMap() {
        collectPlayersData(); // 全プレイヤーの最新情報を収集

        // 【変更】チーム分け対象のプレイヤー（選択済み かつ 名前がある）をフィルタリング
        const participants = players.filter(p => p.selected && p.name);

        // 【変更】参加者に対するバリデーション
        if (participants.length === 0) {
            alert('チーム分けに参加するプレイヤー（チェックボックスON）を1人以上選択してください。');
            return;
        }
        if (participants.length > 10) {
            alert('チーム分けに参加するプレイヤーは最大10人までです。現在 ' + participants.length + ' 人選択されています。');
            return;
        }
        if (participants.length < 2) {
             alert('チーム分けには最低2人の参加プレイヤーが必要です。');
             return;
        }

        // チーム分けロジック (対象は 'participants' 配列)
        let teamAttacker = [];
        let teamDefender = [];
        let rankSumAttacker = 0;
        let rankSumDefender = 0;

        let bestAttackerTeam = [];
        let bestDefenderTeam = [];
        let minDiff = Infinity;

        // 1000回試行して最も均等な組み合わせを探す
        for (let i = 0; i < 1000; i++) {
            let currentShuffledPlayers = [...participants].sort(() => 0.5 - Math.random()); // 【変更】participants を使用
            let currentAttacker = [];
            let currentDefender = [];
            let currentRankSumAttacker = 0;
            let currentRankSumDefender = 0;

            currentShuffledPlayers.forEach((player) => {
                // 人数が少ないチーム、またはランク合計が低いチームに優先的に追加
                // チーム上限5人の制約は維持
                if (currentAttacker.length < Math.ceil(currentShuffledPlayers.length / 2) &&
                    (currentAttacker.length <= currentDefender.length || currentRankSumAttacker <= currentRankSumDefender)) {
                    if (currentAttacker.length < 5) { 
                        currentAttacker.push(player);
                        currentRankSumAttacker += player.rankValue;
                    } else if (currentDefender.length < 5) {
                        currentDefender.push(player);
                        currentRankSumDefender += player.rankValue;
                    }
                } else if (currentDefender.length < 5) { 
                    currentDefender.push(player);
                    currentRankSumDefender += player.rankValue;
                } else if (currentAttacker.length < 5) {
                    currentAttacker.push(player);
                    currentRankSumAttacker += player.rankValue;
                }
            });

            // 参加者が9人以下の場合の人数調整
            if (currentShuffledPlayers.length <= 9) {
                while (currentAttacker.length > 5 || (currentAttacker.length > currentDefender.length + 1 && currentAttacker.length > Math.ceil(currentShuffledPlayers.length / 2))) {
                    if (currentDefender.length < 5) {
                        currentDefender.push(currentAttacker.pop());
                    } else break; 
                }
                while (currentDefender.length > 5 || (currentDefender.length > currentAttacker.length + 1 && currentDefender.length > Math.ceil(currentShuffledPlayers.length / 2))) {
                     if (currentAttacker.length < 5) {
                        currentAttacker.push(currentDefender.pop());
                    } else break;
                }
            }


            // 合計値の差を計算
            const diff = Math.abs(currentRankSumAttacker - currentRankSumDefender);
            if (diff < minDiff) {
                minDiff = diff;
                bestAttackerTeam = currentAttacker;
                bestDefenderTeam = currentDefender;
            } else if (diff === minDiff) {
                // 差が同じ場合は、人数のバランスが良い方を優先
                const currentBalance = Math.abs(currentAttacker.length - currentDefender.length);
                const bestBalance = Math.abs(bestAttackerTeam.length - bestDefenderTeam.length);
                if (currentBalance < bestBalance) {
                    bestAttackerTeam = currentAttacker;
                    bestDefenderTeam = currentDefender;
                }
            }
        }

        teamAttacker = bestAttackerTeam;
        teamDefender = bestDefenderTeam;
        rankSumAttacker = teamAttacker.reduce((sum, p) => sum + p.rankValue, 0);
        rankSumDefender = teamDefender.reduce((sum, p) => sum + p.rankValue, 0);


        // チーム表示更新
        displayTeam(teamAttacker, attackerPlayersUl);
        displayTeam(teamDefender, defenderPlayersUl);
        attackerRankSumSpan.textContent = rankSumAttacker;
        defenderRankSumSpan.textContent = rankSumDefender;

        // マップ選択
        selectRandomMap();
        saveLastTeamAndMap(teamAttacker, teamDefender, rankSumAttacker, rankSumDefender, selectedMap);
    }

    function displayTeam(team, ulElement) {
        ulElement.innerHTML = ''; // リストをクリア
        team.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name} (ランク: ${player.rankName})`;
            ulElement.appendChild(li);
        });
    }

    function selectRandomMap() {
        const availableMaps = allMaps.filter(map => map.selected);
        if (availableMaps.length > 0) {
            selectedMap = availableMaps[Math.floor(Math.random() * availableMaps.length)];
            mapNameP.textContent = selectedMap.name;
            mapImageImg.src = `img/${selectedMap.file}`; 
            mapImageImg.alt = selectedMap.name;
            mapImageImg.style.display = 'block';
        } else {
            mapNameP.textContent = '選択可能なマップがありません';
            mapImageImg.src = '';
            mapImageImg.style.display = 'none';
            selectedMap = null;
        }
    }

    /**
     * 【変更】保存されたプレイヤー情報（チェック状態含む）を元に、入力欄を再描画する
     */
    function renderPlayerInputs() {
        playerEntriesContainer.innerHTML = ''; // 既存の入力欄をクリア
        players.forEach(player => {
            // 保存された selected 状態を渡す。未定義ならデフォルト(true)
            addPlayerEntry(player.name, player.rankName, player.id, player.selected !== undefined ? player.selected : true);
        });
        // プレイヤーデータが全くない場合のみ、初期入力欄を追加
        if (players.length === 0) { 
            addInitialPlayerEntries();
        }
    }


    // --- 設定関連の関数 ---
    function renderRankSettings() {
        rankSettingsContainer.innerHTML = '';
        rankTiers.forEach((tier, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('rank-setting-item');

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = tier.name;
            nameInput.placeholder = 'ランク名 (例: A+)';
            itemDiv.appendChild(nameInput);

            const valueInput = document.createElement('input');
            valueInput.type = 'number';
            valueInput.value = tier.value;
            valueInput.placeholder = '強さ';
            itemDiv.appendChild(valueInput);

            const deleteRankButton = document.createElement('button');
            deleteRankButton.textContent = '×';
            deleteRankButton.classList.add('delete-rank-button');
            deleteRankButton.addEventListener('click', () => {
                rankTiers.splice(index, 1);
                renderRankSettings(); // 再描画
            });
            itemDiv.appendChild(deleteRankButton);

            rankSettingsContainer.appendChild(itemDiv);
        });
        // 既存のプレイヤー入力欄のセレクトボックスも更新
        updateAllPlayerRankSelects();
    }

    function addNewRankSettingInput() {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('rank-setting-item');

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = '新しいランク名';
        itemDiv.appendChild(nameInput);

        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.placeholder = '強さ';
        itemDiv.appendChild(valueInput);

        const tempDeleteButton = document.createElement('button'); // 一時的な削除ボタン
        tempDeleteButton.textContent = '×';
        tempDeleteButton.onclick = () => itemDiv.remove();
        itemDiv.appendChild(tempDeleteButton);

        rankSettingsContainer.appendChild(itemDiv);
    }


    function saveRankSettings() {
        const newRankTiers = [];
        const settingItems = rankSettingsContainer.querySelectorAll('.rank-setting-item');
        let valid = true;
        settingItems.forEach(item => {
            const name = item.querySelector('input[type="text"]').value.trim();
            const value = parseInt(item.querySelector('input[type="number"]').value);
            if (name && !isNaN(value)) {
                newRankTiers.push({ name, value });
            } else {
                valid = false;
            }
        });

        if (!valid || newRankTiers.length === 0) {
            alert('すべてのランク名と有効な数値を入力してください。');
            renderRankSettings(); 
            return;
        }

        rankTiers = newRankTiers;
        rankTiers.sort((a, b) => b.value - a.value); 
        renderRankSettings(); 
        updateAllPlayerRankSelects(); 
        localStorage.setItem('valorantRankTiers', JSON.stringify(rankTiers));
        alert('ランク設定を保存しました。');
    }

    function updateAllPlayerRankSelects() {
        const allSelects = playerEntriesContainer.querySelectorAll('select');
        allSelects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = ''; // オプションをクリア
            rankTiers.forEach(tier => {
                const option = document.createElement('option');
                option.value = tier.name;
                option.textContent = `${tier.name} (${tier.value})`;
                select.appendChild(option);
            });
            // 元の値があれば再選択
            if (rankTiers.some(t => t.name === currentValue)) {
                select.value = currentValue;
            } else if (rankTiers.length > 0) {
                select.value = rankTiers[0].name; // デフォルトは最初のランク
            }
        });
        savePlayers(); // ランク選択肢が変わった可能性があるのでプレイヤーデータを保存
    }


    function renderMapSelection() {
        mapSelectionContainer.innerHTML = '';
        allMaps.forEach((map, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('map-select-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `map_checkbox_${index}`;
            checkbox.checked = map.selected;
            checkbox.dataset.mapName = map.name;

            const label = document.createElement('label');
            label.htmlFor = `map_checkbox_${index}`;
            label.textContent = map.name;

            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            mapSelectionContainer.appendChild(itemDiv);
        });
    }

    function saveMapSettings() {
        const checkboxes = mapSelectionContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const mapName = checkbox.dataset.mapName;
            const mapObj = allMaps.find(m => m.name === mapName);
            if (mapObj) {
                mapObj.selected = checkbox.checked;
            }
        });
        localStorage.setItem('valorantMaps', JSON.stringify(allMaps));
        alert('マップ設定を保存しました。');
    }

    function resetTeamDisplay() {
        attackerPlayersUl.innerHTML = '';
        defenderPlayersUl.innerHTML = '';
        attackerRankSumSpan.textContent = '0';
        defenderRankSumSpan.textContent = '0';
        mapNameP.textContent = 'マップはまだ選択されていません';
        mapImageImg.src = '';
        mapImageImg.style.display = 'none';
        selectedMap = null;
        localStorage.removeItem('lastTeamData');
        alert('チーム表示とマップをリセットしました。');
    }

    // --- 結果出力 ---
    function copyResultToClipboard() {
        if (!selectedMap || attackerPlayersUl.children.length === 0 && defenderPlayersUl.children.length === 0) {
            alert('チーム分けとマップ選択を先に実行してください。');
            return;
        }

        const attackerNames = Array.from(attackerPlayersUl.children).map(li => li.textContent.split(' (ランク:')[0]);
        const defenderNames = Array.from(defenderPlayersUl.children).map(li => li.textContent.split(' (ランク:')[0]);

        const textToCopy = `マップ : ${selectedMap.name} | アタッカー : ${attackerNames.join(', ')} | ディフェンダー : ${defenderNames.join(', ')}`;
        resultTextTextarea.value = textToCopy;
        resultTextTextarea.select();
        try {
            document.execCommand('copy');
            alert('結果をクリップボードにコピーしました！');
        } catch (err) {
            alert('コピーに失敗しました。手動でコピーしてください。');
            console.error('Copy failed:', err);
        }
        resultTextTextarea.blur();
    }

    // --- ローカルストレージ関連 ---
    function savePlayers() {
        collectPlayersData(); // 最新のプレイヤー情報（チェック状態含む）を取得
        localStorage.setItem('valorantPlayers', JSON.stringify(players));
    }

    function loadPlayers() {
        const storedPlayers = localStorage.getItem('valorantPlayers');
        if (storedPlayers) {
            players = JSON.parse(storedPlayers);
        } else {
            players = []; // データがない場合は空配列
        }
    }

    function loadRankTiers() {
        const storedRankTiers = localStorage.getItem('valorantRankTiers');
        if (storedRankTiers) {
            rankTiers = JSON.parse(storedRankTiers);
        }
    }

    function loadMaps() {
        const storedMaps = localStorage.getItem('valorantMaps');
        if (storedMaps) {
            const loadedMaps = JSON.parse(storedMaps);
            allMaps = allMaps.map(defaultMap => {
                const loadedMap = loadedMaps.find(lm => lm.name === defaultMap.name);
                return loadedMap ? { ...defaultMap, selected: loadedMap.selected } : defaultMap;
            });
        }
    }

    function saveLastTeamAndMap(teamA, teamD, sumA, sumD, map) {
        const lastTeamData = {
            attackerTeam: teamA.map(p => ({name: p.name, rankName: p.rankName})),
            defenderTeam: teamD.map(p => ({name: p.name, rankName: p.rankName})),
            attackerRankSum: sumA,
            defenderRankSum: sumD,
            selectedMap: map
        };
        localStorage.setItem('lastTeamData', JSON.stringify(lastTeamData));
    }

    function loadLastTeamAndMap() {
        const lastData = localStorage.getItem('lastTeamData');
        if (lastData) {
            const data = JSON.parse(lastData);
            if (data.attackerTeam && data.defenderTeam && data.selectedMap) {
                displayTeam(data.attackerTeam, attackerPlayersUl);
                displayTeam(data.defenderTeam, defenderPlayersUl);
                attackerRankSumSpan.textContent = data.attackerRankSum;
                defenderRankSumSpan.textContent = data.defenderRankSum;
                selectedMap = data.selectedMap;
                mapNameP.textContent = selectedMap.name;
                mapImageImg.src = `img/${selectedMap.file}`;
                mapImageImg.alt = selectedMap.name;
                mapImageImg.style.display = 'block';
            }
        }
    }


    function loadData() {
        loadRankTiers();
        loadMaps();
        loadPlayers(); 
        // renderPlayerInputs() は loadPlayers の後に呼び出す
        renderPlayerInputs(); 
        updateAllPlayerRankSelects(); 
        loadLastTeamAndMap(); 
    }

    function resetAllApplicationData() {
        if (confirm("本当にすべてのプレイヤー情報、ランク設定、マップ設定をリセットしますか？この操作は元に戻せません。")) {
            localStorage.removeItem('valorantPlayers');
            localStorage.removeItem('valorantRankTiers');
            localStorage.removeItem('valorantMaps');
            localStorage.removeItem('lastTeamData');

            // デフォルト値にリセット
            players = [];
            rankTiers = [
                { name: 'A+', value: 5 }, { name: 'A', value: 4 },
                { name: 'B+', value: 3 }, { name: 'B', value: 2 }, { name: 'C', value: 1 }
            ];
            allMaps.forEach(map => map.selected = true); 

            // 表示を更新
            renderPlayerInputs(); // これで addInitialPlayerEntries が呼ばれる
            renderRankSettings();
            renderMapSelection();
            resetTeamDisplay();

            alert("すべてのデータがリセットされました。");
        }
    }
});
