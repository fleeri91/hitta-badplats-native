import { create } from 'zustand'

type view = 'map' | 'list'

type ViewNavigationState = {
  view: view
}

type ViewNavigationActions = {
  setView: (view: view) => void
}

const initialState: ViewNavigationState = {
  view: 'map',
}

export const useViewNavigationStore = create<
  ViewNavigationState & ViewNavigationActions
>((set) => ({
  ...initialState,
  setView: (view: view) => set((state) => ({ ...state, view: view })),
}))
