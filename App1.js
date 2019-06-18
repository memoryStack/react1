import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions, ListView, TouchableOpacity} from 'react-native';
import Data from './UserData.js'

let CUSTOM_HEIGHT_TIMEOUT_MS = 10000
// const PERFECTLY_ON_SCREEN = 0; // `perfectly on screen`
// const IRRELEVANT = 1; // `irrelevant`
// const NEITHER_STARTS_ON_SCREEN_NOR_ENDS = 2; // `view neither starts on screen nor ends`
// const STARTS_BUT_DOESNT_END = 3; // `view starts on screen but doesn't end`
// const ENDS_BUT_DOESNT_START = 4; // `view ends on screen but doesn't starts`;

class App extends React.Component {

  constructor(props) {
    super(props);
    
    this.screenHeight = Math.round(Dimensions.get('window').height);
    this.itemsMap = new Map();
    this.deepestScrolledRow = {rowId: '',rowY: 0}
    this.lastScroll = 0;
    this.nowScrollPosition = 0;
    this.calledOnce = 0;
    this.upperBar=0;
    this.lowerBar=0;
    this.screenTypeDInfo = {itemId: 'not D'};
    this.lastScrollingDirection = 'neutral';
    this.rerenderedInfo = {
      isSizeChanged : 1,
      sizeChangeSection : 'nowhere',
      sizeChangeType: 'neutral',
      sizeChangedValue: 0,
    }
    
    // ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(Data),
    };    
  }

  componentDidMount() {
    // setTimeout(this.func(), 30);
  }

  // onRowLayoutMade = (rowKey, event) => {
    onRowLayoutMade = (rowIdentifier, event) => {
    
      let { x, y, width, height } = event.nativeEvent.layout
      
      const itemProps = {
        seenCount: 0,
        yCoordinate: Math.ceil(y),
        height: Math.floor(height),
      }
  
      let item = this.itemsMap.get(rowIdentifier)
      if (item === undefined) { 
        if(itemProps.height === 0 || rowIdentifier === 'PRODUCT') return // let's ditch these
        // console.log('@@@rendered ', rowIdentifier, ' ', height)
        this.itemsMap.set(rowIdentifier, itemProps)
  
      } else {
        
        // TODO:later
        // if 'expansion' is happening then view originally should be above the screen totally otherwise no new item would be rendered on the screen
        if(Math.floor(height) - item.height > 0){
          if(Math.floor(y) + item.height < this.nowScrollPosition + this.screenHeight) { 
            this.rerenderedInfo.sizeChangedValue += Math.floor(height) - item.height
            console.log('@@@@@:expansion noticed in ', rowIdentifier)
          }
        }
  
        // if 'shrinking' is happening then check if final layout of view is above (this.nowScroll + this.screenHeight) or not.
        if(Math.floor(height) - item.height < 0){
          if(Math.floor(y) + Math.floor(height) < this.nowScrollPosition + this.screenHeight) {
            this.rerenderedInfo.sizeChangedValue += Math.floor(height) - item.height
            console.log('@@@@@:shrinking noticed in ', rowIdentifier)
          }
        }
        
        console.log('@@@@@@: DDDDDDDDD ', rowIdentifier, item.yCoordinate, y, item.height, height)
        
        //	TODO: focus on this
        if (this.rerenderedInfo.isSizeChanged === 1) {
          this.rerenderedInfo.isSizeChanged = 0
  
          // look at the first rerendered view to find where change happened
          if (item.yCoordinate-this.nowScrollPosition < 0) {
            this.rerenderedInfo.sizeChangeSection = 'above'
          }
  
          if (item.yCoordinate - this.nowScrollPosition >= 0 && item.yCoordinate - this.nowScrollPosition <= this.screenHeight) {
            this.rerenderedInfo.sizeChangeSection = 'onscreen'
          }
  
          setTimeout(() => {
            console.log('@@@@@@ SizeChange: ', this.rerenderedInfo.sizeChangedValue);
            
            // in shrinking "this.rerenderedInfo.sizeChangedValue" would be negative so simply add it in both 
            // shrinking and expansion 
            if (this.rerenderedInfo.sizeChangedValue < 0)
              this.rerenderedInfo.sizeChangeType = 'shrink'
            
            if (this.rerenderedInfo.sizeChangedValue > 0)
              this.rerenderedInfo.sizeChangeType = 'expand'
            
            // TODO:Focus on this on this one too.
            if (this.screenTypeDInfo.itemId === rowIdentifier) { // the view that changed size was the ScreenType D's view
              this.screenTypeDInfo.itemId = 'not D'
            }
  
            if ((this.rerenderedInfo.sizeChangeSection === 'onscreen' || this.rerenderedInfo.sizeChangeSection === 'above') 
              && this.rerenderedInfo.sizeChangeType !== 'neutral') {
              this.viewsRerendered(); // call for whole process
            }
          }, 0);	
        }
        
        itemProps.seenCount = this.itemsMap.get(rowIdentifier).seenCount
        this.itemsMap.set(rowIdentifier, itemProps)
      }
    }
    
      searchRangeWhenListGoingUp = () => {
      let rangeMin, rangeMax
      if (this.screenTypeDInfo.itemId !== 'not D') { // last screen type was D, then search space is a little bit different
        if (this.lastScrollingDirection === 'up') { // U D U
          rangeMin = this.upperBar - this.rerenderedInfo.sizeChangedValue
          rangeMax = this.nowScrollPosition + this.screenHeight
        }
        if (this.lastScrollingDirection === 'down') { // D D U
          rangeMin = this.lowerBar + this.rerenderedInfo.sizeChangedValue
          rangeMax = this.nowScrollPosition + this.screenHeight
        }
      }
      else{ 
        rangeMin = this.lowerBar + this.rerenderedInfo.sizeChangedValue 
        rangeMax = this.nowScrollPosition + this.screenHeight
      }
      return {rangeMin, rangeMax}
      }
  
    searchRangeWhenListGoingDown = () => {
      let rangeMin, rangeMax
      if (this.screenTypeDInfo.itemId !== 'not D') { // last screen type was D, then search space is a little bit different
        if (this.lastScrollingDirection === 'up') { // U D D
          rangeMin = this.nowScrollPosition
          rangeMax = this.upperBar + this.rerenderedInfo.sizeChangedValue
        }
        if (this.lastScrollingDirection === 'down') { // D D D 
          rangeMin = this.nowScrollPosition
          rangeMax = this.lowerBar + this.rerenderedInfo.sizeChangedValue
        }
      }
      else{
        rangeMin = this.nowScrollPosition
        rangeMax = this.upperBar + this.rerenderedInfo.sizeChangedValue
      }
      return {rangeMin, rangeMax}
    }
  
    viewsRerendered = () => {
        // before coming to here scroll would be updated already;
        
        let rangeObj;
        if (this.rerenderedInfo.sizeChangeType === 'shrink') {
        
          rangeObj = this.searchRangeWhenListGoingUp()
          // console.log('ranges: ', rangeObj.rangeMin, rangeObj.rangeMax)
          // console.log('@@@@minRange: ', rangeObj.rangeMin, '@@@@maxRange', rangeObj.rangeMax)
          this.raiseSeenCount(rangeObj.rangeMin, rangeObj.rangeMax)
          this.lastScrollingDirection = 'up'
        }
  
        if (this.rerenderedInfo.sizeChangeType === 'expand' && this.rerenderedInfo.sizeChangeSection === 'above') {
        
          rangeObj = this.searchRangeWhenListGoingDown()
          this.raiseSeenCount(rangeObj.rangeMin, rangeObj.rangeMax)
          this.lastScrollingDirection = 'down'
        }
        
        this.updateBarValues()
  
        this.rerenderedInfo.sizeChangeSection = 'nowhere'
        this.rerenderedInfo.isSizeChanged = 1
        this.rerenderedInfo.sizeChangeType = 'neutral'
        this.rerenderedInfo.sizeChangedValue = 0
      }
  
    viewStatusOnScreen = (value) => { // view starts and ends completely on screen
      const startY = value.yCoordinate - this.nowScrollPosition
      const endY = startY + value.height
  
      if((startY < 0 && endY < 0) || (startY > this.screenHeight && endY > this.screenHeight)) return 1
      if(startY >= 0 && endY <= this.screenHeight) return 0
      if(startY < 0 && endY > this.screenHeight) return 2
      if(startY >= 0 && endY > this.screenHeight) return 3
      if(startY < 0 && endY <= this.screenHeight) return 4
    }
  
    screenStatus = () => {
  
      let viewStarts = 0, viewEnds = 0
      for (let [key, value] of this.itemsMap.entries()) {
        let viewStatus = this.viewStatusOnScreen(value)
        if (viewStatus === 1) continue
        if (viewStatus === 0) return 'E'
        if (viewStatus === 3) viewStarts = 1
        if (viewStatus === 4) viewEnds = 1
      }
  
      if (viewStarts === 0 && viewEnds === 0) return 'D'
      if (viewStarts === 1 && viewEnds === 1) return 'A'
      if (viewStarts === 1 && viewEnds === 0) return 'B'
      if (viewStarts === 0 && viewEnds === 1) return 'C'
    }
  
    updateBarValues = () => {
      let updateLowerBar = Number.NEGATIVE_INFINITY
      let updateUpperBar = Number.POSITIVE_INFINITY
  
      let SS = this.screenStatus()
      
      this.screenTypeDInfo.itemId = 'not D'
  
      if(SS === 'A' || SS === 'B'){
        for (let [key, value] of this.itemsMap.entries()) {
          if(this.viewStatusOnScreen(value) === 3){
            updateUpperBar = updateLowerBar = value.yCoordinate
          }
        }
      }
      
      if(SS === 'C'){
        for (let [key, value] of this.itemsMap.entries()) {
          if(this.viewStatusOnScreen(value) === 4){
            updateUpperBar = updateLowerBar = value.yCoordinate + value.height
          }
        } 
      }
      
      if (SS === 'D') {
        console.log('screenTypeD')
        for (let [key, value] of this.itemsMap.entries()) {
          const viewStartY = value.yCoordinate
          const viewEndY = value.yCoordinate + value.height
          if (viewStartY < this.nowScrollPosition && viewEndY > this.nowScrollPosition + this.screenHeight) {
            this.screenTypeDInfo.itemId = key // id of view for screen type D got stored
            this.lowerBar = value.yCoordinate + value.height
            this.upperBar = value.yCoordinate
            break
          }
        } 
      }
  
      if(SS === 'E'){
        for (let [key, value] of this.itemsMap.entries()) {
          if(this.viewStatusOnScreen(value) === 0){
            updateLowerBar = Math.max(updateLowerBar, value.yCoordinate + value.height)
            updateUpperBar = Math.min(updateUpperBar, value.yCoordinate)
          }
        }
      }
  
      if(updateLowerBar !== Number.NEGATIVE_INFINITY)
        this.lowerBar = updateLowerBar
      if(updateUpperBar !== Number.POSITIVE_INFINITY)
        this.upperBar = updateUpperBar
      
      console.log('@@@upperBar: ', this.upperBar, ' @@@lowerBar: ', this.lowerBar);
    }
  
  
    raiseSeenCount = (rangeMin, rangeMax) => {
      console.log('@@@@@: NowScroll ', this.nowScrollPosition)
      console.log('@@@@minRange: ', rangeMin, '@@@@maxRange', rangeMax)
      for (let [key, value] of this.itemsMap.entries()) {
        if(value.yCoordinate >= rangeMin && value.yCoordinate + value.height <= rangeMax){
          ++value.seenCount
          console.log(key, value.seenCount, 'got updated@@@@@@@@@')
          console.log('@@@@@@@@: ', value.yCoordinate, value.height)
        }
      }
    }
  
    oneTimeCall = () => {
      let rangeMin = this.nowScrollPosition, rangeMax = this.screenHeight + this.nowScrollPosition
      this.raiseSeenCount(rangeMin, rangeMax)
      this.updateBarValues()
    }
  
    func = () => {
      console.log('@@@@@@######################################################')
      
      let rangeObj
      if (this.nowScrollPosition > this.lastScroll) { // list going up
        rangeObj = this.searchRangeWhenListGoingUp()
      }else{ // list going down
        rangeObj = this.searchRangeWhenListGoingDown()
      }
  
      // console.log('@@@@minRange: ', rangeObj.rangeMin, '@@@@maxRange', rangeObj.rangeMax)
      this.raiseSeenCount(rangeObj.rangeMin, rangeObj.rangeMax)
      this.updateBarValues()
  
      // console.log(`upperBar: ${this.upperBar} lowerBar: ${this.lowerBar}`);
      if (this.lastScroll > this.nowScrollPosition) {
        this.lastScrollingDirection = 'down' // list moved down
      }
      if (this.lastScroll < this.nowScrollPosition) {
        this.lastScrollingDirection = 'up' // list moved up
      }
  
      this.lastScroll = this.nowScrollPosition
    }
  
  

  scrollMomentumStopped = (event) => {
    this.nowScrollPosition = Math.round(event.nativeEvent.contentOffset.y);
    this.func();
  }

  handleScroll = (event) => { 
    // TODO: have to update the scroll for 'Edge Case 1'
    this.nowScrollPosition = Math.round(event.nativeEvent.contentOffset.y);
  }

  render() {
    
    return (
        <ListView 
          onEndReachedThreshold={1}
          onScroll={this.handleScroll}
          onMomentumScrollEnd={this.scrollMomentumStopped}
          scrollRenderAheadDistance={this.screenHeight}
          style = {styles.listContainer}
          dataSource = {this.state.dataSource}
          renderRow={this.Row} 
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}>
        </ListView>
    );
  }

  Row = (rowData, _ , rowId) => {
    return(
      <RowItem
        rowData={ rowData }
        rowId={ rowId }
        handleOnLayout={ this.onRowLayoutMade }
      />
    )
  }
}

class RowItem extends React.Component {

  constructor(props) {
    super(props)
    this.state = { useCustomHeight: false };
  }

  componentDidMount() {
    if (this.props.rowData.email === 'mario.walters@example.com')
      setTimeout(() => this.setState({ useCustomHeight: true }), CUSTOM_HEIGHT_TIMEOUT_MS)
  }
  
  render() {
    const { rowData, rowId, handleOnLayout } = this.props
    const styleList = [ styles.rowContainer, this.state.useCustomHeight ? { height: 1500 } : {} ]

    return (
        <View style={styleList}
              onLayout={e => handleOnLayout(rowData.email, e)}>     
              <Image source={{ uri: rowData.picture.large}} style={styles.photo} />
              <Text style={styles.text}>
              {`${rowData.name.first} ${rowData.name.last} ${rowId}`}
              </Text>
              <View style={styles.emptyView}/>
        </View>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  rowContainer: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height:600,
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
  },
  photo: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  separator: {
    flex: 1,
    height: 10,
    backgroundColor: '#8E8E8E',
  },
  
});

