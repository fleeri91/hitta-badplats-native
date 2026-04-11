import { create } from 'zustand'

type View = 'map' | 'list'

type ViewNavigationState = {
  view: View
}

type ViewNavigationActions = {
  setView: (view: View) => void
}

const initialState: ViewNavigationState = {
  view: 'map',
}

export const useViewNavigationStore = create<
  ViewNavigationState & ViewNavigationActions
>((set) => ({
  ...initialState,
  setView: (view) => set({ view }),
}))
