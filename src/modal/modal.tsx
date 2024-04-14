import React, { useEffect, ReactNode } from "react";
import "./modal.css";

const ModalContent = ({
    toggleModal,
    setModal,
    children,
  }: {
    toggleModal: () => void;
    setModal: (modal: boolean) => void;
    children: ReactNode;
  }) => {

  toggleModal();

  useEffect(() => {
    setTimeout(() => {
      setModal(false)
    }, 2000)
  }, [])

  return <div className="modal">
    <div onClick={toggleModal} className="overlay"></div>
    <div className="modal-content">
      {children}
    </div>
  </div>
}

export default function Modal({modal, setModal, modalMessage}: {
  modal: boolean;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalMessage: string
}) {
  const toggleModal = () => {
    setModal(currentState => !currentState)
  }

  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal")
    } else {
      document.body.classList.remove("active-modal")
    }
  }, [modal])

  return (
    <>
      {/*If "modal" evaluates to
       true, return the modal.*/}
      {modal && (
        <ModalContent toggleModal={toggleModal} setModal={setModal}>
          <h2>{modalMessage}</h2>
        </ModalContent>
      )}
    </>
  );
}